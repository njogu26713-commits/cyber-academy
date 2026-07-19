import express from 'express';
import { LessonProgress, QuizResult } from '../db.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated.' });
  next();
}

// Get all progress for the current user
router.get('/', requireAuth, async (req, res) => {
  const [lessons, quizAgg] = await Promise.all([
    LessonProgress.find({ userId: req.session.userId })
      .select('lessonId status startedAt completedAt'),
    QuizResult.aggregate([
      { $match: { userId: req.session.userId } },
      { $group: {
        _id: '$lessonId',
        total:   { $sum: 1 },
        correct: { $sum: { $cond: ['$correct', 1, 0] } },
      }},
    ]),
  ]);

  const quizStats = quizAgg.map(q => ({
    lesson_id: q._id,
    total: q.total,
    correct: q.correct,
  }));

  const lessonsOut = lessons.map(l => ({
    lesson_id:    l.lessonId,
    status:       l.status,
    started_at:   l.startedAt,
    completed_at: l.completedAt,
  }));

  res.json({ lessons: lessonsOut, quizStats });
});

// Mark lesson as started or completed
router.post('/lesson', requireAuth, async (req, res) => {
  const { lessonId, status } = req.body;
  if (!lessonId || !['in_progress', 'completed'].includes(status))
    return res.status(400).json({ error: 'Invalid request.' });

  const now = new Date();
  const update = { status };
  if (status === 'in_progress') update.$setOnInsert = { startedAt: now };
  if (status === 'completed')   update.completedAt = now;

  await LessonProgress.findOneAndUpdate(
    { userId: req.session.userId, lessonId },
    status === 'in_progress'
      ? { $set: { status }, $setOnInsert: { startedAt: now } }
      : { $set: { status, completedAt: now } },
    { upsert: true }
  );

  res.json({ ok: true });
});

// Save quiz result
router.post('/quiz', requireAuth, async (req, res) => {
  const { lessonId, question, correct } = req.body;
  if (!lessonId || !question) return res.status(400).json({ error: 'Invalid request.' });

  await QuizResult.create({
    userId: req.session.userId,
    lessonId,
    question,
    correct: !!correct,
  });

  res.json({ ok: true });
});

export default router;
