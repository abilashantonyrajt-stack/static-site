const path = require('path');
const os = require('os');
const { DatabaseSync } = require('node:sqlite');

// Vercel's filesystem is read-only except /tmp — use tmpdir there so SQLite can write.
// Locally we keep salon.db next to db.js for persistence.
const dbPath = process.env.VERCEL
  ? path.join(os.tmpdir(), 'salon.db')
  : path.join(__dirname, 'salon.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'upcoming',
    payment_method TEXT NOT NULL DEFAULT 'cod',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    transaction_id TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_open_slot
    ON appointments(date, time)
    WHERE status = 'upcoming';`);

// Auto-migrate existing DBs (local file before this deploy) - safe if columns already exist
try { db.exec('ALTER TABLE appointments ADD COLUMN payment_method TEXT NOT NULL DEFAULT "cod"'); } catch {}
try { db.exec('ALTER TABLE appointments ADD COLUMN payment_status TEXT NOT NULL DEFAULT "pending"'); } catch {}
try { db.exec('ALTER TABLE appointments ADD COLUMN transaction_id TEXT DEFAULT ""'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    price TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS otps (
    email TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
 `);

const seed = db.prepare(`
  INSERT OR IGNORE INTO services (id, name, emoji, price)
  VALUES (?, ?, ?, ?)
`);

[
  ['hair-styling', 'Hair Styling', '💇', '$50'],
  ['hair-treatment', 'Hair Treatment', '💆', '$60'],
  ['manicure', 'Manicure', '💅', '$35'],
  ['pedicure', 'Pedicure', '👣', '$40'],
  ['spa', 'Spa', '🧖', '$75'],
  ['facial', 'Facial', '✨', '$55']
].forEach((service) => seed.run(...service));

module.exports = db;
