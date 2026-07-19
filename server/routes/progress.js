import express from 'express';
import db from '../db.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated.' });
  next();
}

// Get all progress for the current user
router.get('/', requireAuth, (req, res) => {
  const lessons = db.prepare(
    'SELECT lesson_id, status, started_at, completed_at FROM lesson_progress WHERE user_id = ?'
  ).all(req.session.userId);

  const quizStats = db.prepare(
    'SELECT lesson_id, COUNT(*) as total, SUM(correct) as correct FROM quiz_results WHERE user_id = ? GROUP BY lesson_id'
  ).all(req.session.userId);

  res.json({ lessons, quizStats });
});

// Mark lesson as started or completed
router.post('/lesson', requireAuth, (req, res) => {
  const { lessonId, status } = req.body;
  if (!lessonId || !['in_progress', 'completed'].includes(status))
    return res.status(400).json({ error: 'Invalid request.' });

  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
    .get(req.session.userId, lessonId);

  if (!existing) {
    db.prepare(
      'INSERT INTO lesson_progress (user_id, lesson_id, status, started_at, completed_at) VALUES (?, ?, ?, ?, ?)'
    ).run(req.session.userId, lessonId, status, now, status === 'completed' ? now : null);
  } else {
    if (status === 'completed') {
      db.prepare(
        'UPDATE lesson_progress SET status = ?, completed_at = ? WHERE user_id = ? AND lesson_id = ?'
      ).run(status, now, req.session.userId, lessonId);
    } else if (existing.status === 'not_started') {
      db.prepare(
        'UPDATE lesson_progress SET status = ?, started_at = ? WHERE user_id = ? AND lesson_id = ?'
      ).run(status, now, req.session.userId, lessonId);
    }
  }

  res.json({ ok: true });
});

// Save quiz result
router.post('/quiz', requireAuth, (req, res) => {
  const { lessonId, question, correct } = req.body;
  if (!lessonId || !question) return res.status(400).json({ error: 'Invalid request.' });

  db.prepare(
    'INSERT INTO quiz_results (user_id, lesson_id, question, correct) VALUES (?, ?, ?, ?)'
  ).run(req.session.userId, lessonId, question, correct ? 1 : 0);

  res.json({ ok: true });
});

export default router;
