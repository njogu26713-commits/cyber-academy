import session from 'express-session';
import db from './db.js';

// Add sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expired INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expired ON sessions(expired);
`);

const Store = session.Store;

export class SQLiteSessionStore extends Store {
  constructor(options = {}) {
    super(options);
    this.ttl = options.ttl || 86400 * 7; // 7 days default
    // Cleanup expired sessions every 15 minutes
    setInterval(() => this._cleanup(), 15 * 60 * 1000).unref();
  }

  _cleanup() {
    db.prepare('DELETE FROM sessions WHERE expired < ?').run(Date.now());
  }

  get(sid, cb) {
    try {
      const row = db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expired > ?').get(sid, Date.now());
      if (!row) return cb(null, null);
      cb(null, JSON.parse(row.sess));
    } catch (err) { cb(err); }
  }

  set(sid, session, cb) {
    try {
      const maxAge = session.cookie?.maxAge || this.ttl * 1000;
      const expired = Date.now() + maxAge;
      db.prepare(
        'INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired'
      ).run(sid, JSON.stringify(session), expired);
      cb(null);
    } catch (err) { cb(err); }
  }

  destroy(sid, cb) {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      cb(null);
    } catch (err) { cb(err); }
  }

  touch(sid, session, cb) {
    try {
      const maxAge = session.cookie?.maxAge || this.ttl * 1000;
      db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?').run(Date.now() + maxAge, sid);
      cb(null);
    } catch (err) { cb(err); }
  }
}
