const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

app.use(cors());
app.use(express.json());
app.use(express.static(FRONT_END));
// Alias so absolute /front-end/... paths (Live Server style) also work on Express
app.use('/front-end', express.static(FRONT_END));

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

app.post('/api/auth/register', (req, res) => {
  const email = parseEmail(req.body);
  const password = String(req.body.password || '');
  const name = String(req.body.name || req.body.username || email.split('@')[0]).trim();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Please enter your name' });
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
    created_at: new Date().toISOString()
  };

  try {
    db.prepare(`
      INSERT INTO appointments
        (id, user_id, service, date, time, duration, full_name, email, phone, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      appointment.created_at
    );
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'That time slot is already booked' });
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

app.listen(PORT, () => {
  console.log(`DA2 Beauty Paradise API running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index%20files/index.html`);
});
