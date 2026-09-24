const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const FRONT_END = path.join(__dirname, '..', 'front-end');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];
const UPI_ID = process.env.UPI_ID || 'antonyabilash51-2@oksbi';
const UPI_NAME = process.env.UPI_NAME || 'DA2 Beauty Paradise';

// Gmail-only + OTP
const GMAIL_RE = /^[^\s@]+@gmail\.com$/i;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 min
const OTP_RESEND_MS = 60 * 1000; // 60s anti-spam
const otpSendLog = new Map(); // email -> last send timestamp

function isGmail(email) { return GMAIL_RE.test(String(email||'').trim()); }

let mailer = null;
function getMailer() {
  if (mailer) return mailer;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.log('SMTP not configured — OTP will be logged to console (set SMTP_USER/SMTP_PASS on Vercel)');
    return null;
  }
  mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
  return mailer;
}

app.use(cors());
app.use(express.json());

// Legacy alias: /profile/... was the screenshot 404 — canonical is /navigation/profile/...
// Also handle duplicate folder front-end/profile vs front-end/navigation/profile
app.use((req, _res, next) => {
  if (req.path.startsWith('/profile/')) {
    req.url = '/navigation' + req.url;
  } else if (req.path === '/profile' ) {
    req.url = '/navigation/profile/Profile.HTML';
  }
  next();
});
app.use(express.static(FRONT_END));
// Alias so absolute /front-end/... paths (Live Server style) also work on Express
app.use('/front-end', express.static(FRONT_END));
// Also expose navigation profile at /profile for backwards compat
app.use('/profile', express.static(path.join(FRONT_END, 'navigation/profile')));

function publicUser(row) {
  return { id: row.id, email: row.email, name: row.name };
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'Please log in' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function mapAppointment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    service: row.service,
    date: row.date,
    time: row.time,
    duration: String(row.duration),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    notes: row.notes || '',
    status: row.status,
    paymentMethod: row.payment_method || 'cod',
    paymentStatus: row.payment_status || 'pending',
    transactionId: row.transaction_id || '',
    createdAt: row.created_at
  };
}

function parseEmail(body) {
  return String(body.email || body.username || '').trim().toLowerCase();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/services', (_req, res) => {
  const services = db.prepare('SELECT id, name, emoji, price FROM services ORDER BY name').all();
  res.json(services);
});

app.get('/api/payment/upi', (_req, res) => {
  res.json({ upiId: UPI_ID, upiName: UPI_NAME });
});

app.post('/api/payment/verify', (req, res) => {
  const paymentMethod = String(req.body.paymentMethod || '').trim().toLowerCase();
  const transactionId = String(req.body.transactionId || '').trim();
  const service = String(req.body.service || '').trim();
  const amount = String(req.body.amount || '').trim();
  // COD needs no verification
  if (paymentMethod === 'cod' || paymentMethod === 'pay_at_salon') {
    return res.json({ ok: true, verified: true, method: 'cod' });
  }
  if (paymentMethod === 'upi') {
    if (!transactionId) {
      return res.status(400).json({ error: 'Please enter Transaction ID after UPI payment' });
    }
    // UPI UTR is typically 12 digits; allow 10-18 alphanum for now
    if (!/^[0-9a-zA-Z]{10,18}$/.test(transactionId)) {
      return res.status(400).json({ error: 'Invalid Transaction ID (should be 10-18 digits)' });
    }
    // Check duplicate UTR already used (prevent replay)
    const dup = db.prepare("SELECT id FROM appointments WHERE transaction_id = ? AND transaction_id != ''").get(transactionId);
    if (dup) {
      return res.status(400).json({ error: 'This Transaction ID was already used' });
    }
    // Optional: verify amount matches service price if provided
    if (service) {
      const svc = db.prepare('SELECT price FROM services WHERE id = ?').get(service);
      if (svc && amount) {
        const expected = String(svc.price).replace(/[^0-9.]/g, '');
        if (String(amount).replace(/[^0-9.]/g, '') !== expected) {
          // Don't block but warn - amount mismatch could be discount; just log
        }
      }
    }
    // TODO: For real gateway (Razorpay/Cashfree), verify via provider API here:
    // e.g., Razorpay: verify signature / fetch paymentId status
    // For now, accept any 10-18 digit UTR as verified (front-end already forced QR payment)
    return res.json({ ok: true, verified: true, method: 'upi', transactionId });
  }
  return res.status(400).json({ error: 'Invalid payment method' });
});

app.post('/api/auth/send-otp', async (req, res) => {
  const email = parseEmail(req.body);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
  if (!isGmail(email)) return res.status(400).json({ error: 'Only Gmail accounts are allowed (must be @gmail.com)' });
  const last = otpSendLog.get(email);
  if (last && Date.now() - last < OTP_RESEND_MS) {
    const wait = Math.ceil((OTP_RESEND_MS - (Date.now() - last))/1000);
    return res.status(429).json({ error: `Please wait ${wait}s before resending OTP` });
  }
  const otp = String(Math.floor(100000 + Math.random()*900000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  db.prepare('INSERT OR REPLACE INTO otps (email, otp, expires_at, verified, created_at) VALUES (?, ?, ?, 0, ?)').run(email, otp, expiresAt, new Date().toISOString());
  otpSendLog.set(email, Date.now());
  const mail = getMailer();
  if (mail) {
    try {
      await mail.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'DA² Beauty Paradise — Your OTP',
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        html: `<div style="font-family:sans-serif;padding:16px;border:1px solid #eee;border-radius:12px"><h2 style="color:#8f7340;margin:0 0 8px">DA² Beauty Paradise</h2><p>Your OTP is <b style="font-size:22px;letter-spacing:3px">${otp}</b></p><p style="color:#666">Expires in 5 minutes. If you didn't request this, ignore.</p></div>`
      });
    } catch (e) {
      console.error('SMTP send failed', e.message);
      console.log(`OTP for ${email}: ${otp} (email failed, logged)`);
    }
  } else {
    console.log(`OTP for ${email}: ${otp} (SMTP not configured)`);
  }
  // Don't leak OTP in production when SMTP is configured
  const response = { ok: true, message: 'OTP sent to your Gmail' };
  if (!mail) response.otp = otp; // expose only when no SMTP (local dev)
  res.json(response);
});

app.post('/api/auth/verify-otp', (req, res) => {
  const email = parseEmail(req.body);
  const otp = String(req.body.otp || '').trim();
  if (!isGmail(email)) return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
  if (!/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'OTP must be 6 digits' });
  const row = db.prepare('SELECT email, otp, expires_at, verified FROM otps WHERE email = ?').get(email);
  if (!row) return res.status(400).json({ error: 'No OTP found — please request OTP first' });
  if (row.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired — please request a new one' });
  db.prepare('UPDATE otps SET verified = 1 WHERE email = ?').run(email);
  res.json({ ok: true, verified: true });
});

app.post('/api/auth/register', (req, res) => {
  const email = parseEmail(req.body);
  const password = String(req.body.password || '');
  const name = String(req.body.name || req.body.username || email.split('@')[0]).trim();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!isGmail(email)) {
    return res.status(400).json({ error: 'Only Gmail is allowed — please use your @gmail.com address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Please enter your name' });
  }
  const otpRow = db.prepare('SELECT verified, expires_at FROM otps WHERE email = ?').get(email);
  if (!otpRow || !otpRow.verified || new Date(otpRow.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Please verify your Gmail with OTP first' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ).run(email, passwordHash, name);
  const user = { id: Number(result.lastInsertRowid), email, name };
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = parseEmail(req.body);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!isGmail(email)) {
    return res.status(400).json({ error: 'Only Gmail is allowed' });
  }
  const otpRow = db.prepare('SELECT verified, expires_at FROM otps WHERE email = ?').get(email);
  if (!otpRow || !otpRow.verified || new Date(otpRow.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Please verify your Gmail with OTP first' });
  }

  const row = db.prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ token: signToken(row), user: publicUser(row) });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  const row = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user.id);
  if (!row) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ user: publicUser(row) });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/appointments/slots', (req, res) => {
  const date = String(req.query.date || '');
  const excludeId = String(req.query.excludeId || '');
  if (!date) {
    return res.status(400).json({ error: 'date query is required' });
  }

  let rows;
  if (excludeId) {
    rows = db.prepare(
      `SELECT time FROM appointments
       WHERE date = ? AND status = 'upcoming' AND id != ?`
    ).all(date, excludeId);
  } else {
    rows = db.prepare(
      `SELECT time FROM appointments WHERE date = ? AND status = 'upcoming'`
    ).all(date);
  }

  res.json({
    date,
    slots: TIME_SLOTS,
    booked: rows.map((row) => row.time)
  });
});

app.get('/api/appointments', authRequired, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json(rows.map(mapAppointment));
});

app.post('/api/appointments', authRequired, (req, res) => {
  // Stale token after redeploy (ephemeral /tmp DB reset) → user no longer exists
  const authedUser = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.id);
  if (!authedUser) {
    return res.status(401).json({ error: 'Session expired after update — please log in again' });
  }

  const body = req.body || {};
  const service = String(body.service || '').trim();
  const date = String(body.date || '').trim();
  const time = String(body.time || '').trim();
  const duration = Number(body.duration);
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const notes = String(body.notes || '').trim();

  if (!service || !date || !time || !fullName || !email || !phone) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!TIME_SLOTS.includes(time)) {
    return res.status(400).json({ error: 'That time slot is not available' });
  }
  if (new Date(`${date}T00:00:00`) < new Date(new Date().toISOString().slice(0, 10))) {
    return res.status(400).json({ error: 'Please choose a future date' });
  }

  const serviceRow = db.prepare('SELECT id FROM services WHERE id = ?').get(service);
  if (!serviceRow) {
    return res.status(400).json({ error: 'Unknown service' });
  }

  const taken = db.prepare(
    `SELECT id FROM appointments WHERE date = ? AND time = ? AND status = 'upcoming'`
  ).get(date, time);
  if (taken) {
    return res.status(409).json({ error: 'That time slot is already booked' });
  }

  let paymentMethod = String(body.paymentMethod || 'cod').trim().toLowerCase();
  if (paymentMethod === 'pay_at_salon') paymentMethod = 'cod';
  let paymentStatus = 'pending';
  const transactionId = String(body.transactionId || '').trim();
  if (!['cod', 'upi'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }
  if (paymentMethod === 'upi') {
    if (!transactionId) {
      return res.status(400).json({ error: 'Please complete UPI payment and enter Transaction ID' });
    }
    if (!/^[0-9a-zA-Z]{10,18}$/.test(transactionId)) {
      return res.status(400).json({ error: 'Invalid Transaction ID (should be 10-18 digits/characters)' });
    }
    const dup = db.prepare("SELECT id FROM appointments WHERE transaction_id = ? AND transaction_id != ''").get(transactionId);
    if (dup) {
      return res.status(400).json({ error: 'This Transaction ID was already used' });
    }
    paymentStatus = 'verified';
  }

  const appointment = {
    id: 'apt_' + crypto.randomBytes(8).toString('hex'),
    user_id: req.user.id,
    service,
    date,
    time,
    duration: [30, 60, 90].includes(duration) ? duration : 60,
    full_name: fullName,
    email,
    phone,
    notes,
    status: 'upcoming',
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    transaction_id: transactionId,
    created_at: new Date().toISOString()
  };

  try {
    db.prepare(`
      INSERT INTO appointments
        (id, user_id, service, date, time, duration, full_name, email, phone, notes, status, payment_method, payment_status, transaction_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointment.id,
      appointment.user_id,
      appointment.service,
      appointment.date,
      appointment.time,
      appointment.duration,
      appointment.full_name,
      appointment.email,
      appointment.phone,
      appointment.notes,
      appointment.status,
      appointment.payment_method,
      appointment.payment_status,
      appointment.transaction_id,
      appointment.created_at
    );
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'That time slot is already booked' });
    }
    if (String(error.message).includes('FOREIGN KEY')) {
      return res.status(401).json({ error: 'Session expired after update — please log out and log in again' });
    }
    throw error;
  }

  res.status(201).json(mapAppointment(appointment));
});

app.patch('/api/appointments/:id/cancel', authRequired, (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!row) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  db.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`).run(row.id);
  res.json(mapAppointment({ ...row, status: 'cancelled' }));
});

app.patch('/api/appointments/:id', authRequired, (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!row) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (row.status === 'cancelled') {
    return res.status(400).json({ error: 'Cancelled appointments cannot be edited' });
  }

  const body = req.body || {};
  const next = {
    service: String(body.service || row.service).trim(),
    date: String(body.date || row.date).trim(),
    time: String(body.time || row.time).trim(),
    duration: Number(body.duration || row.duration),
    full_name: String(body.fullName || row.full_name).trim(),
    email: String(body.email || row.email).trim(),
    phone: String(body.phone || row.phone).trim(),
    notes: String(body.notes ?? row.notes).trim()
  };

  const taken = db.prepare(
    `SELECT id FROM appointments
     WHERE date = ? AND time = ? AND status = 'upcoming' AND id != ?`
  ).get(next.date, next.time, row.id);
  if (taken) {
    return res.status(409).json({ error: 'That time slot is already booked' });
  }

  try {
    db.prepare(`
      UPDATE appointments
      SET service = ?, date = ?, time = ?, duration = ?,
          full_name = ?, email = ?, phone = ?, notes = ?
      WHERE id = ?
    `).run(
      next.service,
      next.date,
      next.time,
      [30, 60, 90].includes(next.duration) ? next.duration : row.duration,
      next.full_name,
      next.email,
      next.phone,
      next.notes,
      row.id
    );
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'That time slot is already booked' });
    }
    throw error;
  }

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json(mapAppointment(updated));
});

app.post('/api/contact', (req, res) => {
  const name = String(req.body.name || req.body.username || '').trim();
  const email = String(req.body.email || '').trim();
  const phone = String(req.body.phone || '').trim();
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();

  if (name.length < 2) {
    return res.status(400).json({ error: 'Please enter a valid name' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (message.length < 5) {
    return res.status(400).json({ error: 'Please enter a message' });
  }

  db.prepare(`
    INSERT INTO contact_messages (name, email, phone, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, email, phone, subject, message, new Date().toISOString());

  res.status(201).json({ ok: true });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(FRONT_END, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err.status === 400 || err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`DA2 Beauty Paradise API running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/`);
  });
}

module.exports = app;
