import express from 'express';
import OpenAI from 'openai';
import db from '../db.js';
import { getLessonById } from '../curriculum.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated.' });
  next();
}

function getOpenAI() {
  if (!process.env.GROQ_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

function buildSystemPrompt(lesson, user, skillLevel) {
  return `You are Kai, the AI cybersecurity instructor at Firebox Cyber Academy. You are enthusiastic, encouraging, and exceptionally skilled at making complex topics easy to understand.

## Your Teaching Style
- Explain concepts clearly, step by step, one idea at a time
- Use real-world analogies and practical examples
- Start simple, then build to more complex ideas
- Use code blocks for commands, scripts, and technical examples
- Ask comprehension questions to check understanding (but don't quiz formally every single message — do it naturally)
- Give hints rather than immediately revealing answers
- Celebrate progress and encourage the student
- Keep lessons interactive and engaging

## Current Lesson
Module: ${lesson.moduleTitle} (${lesson.moduleLevel} level)
Lesson: ${lesson.title}
Description: ${lesson.description}
Key Topics to Cover: ${lesson.topics.join(', ')}

## Student
Name: ${user.username}
Skill Level: ${skillLevel}

## Important Rules
- Stay focused on the current lesson topic
- If the student seems confused, rephrase and use a different analogy
- Gradually adjust complexity based on their responses
- When you want to give a formal quiz question, embed it EXACTLY in this format (one per message, only when appropriate after teaching):

[QUIZ]{"question":"...","options":["A: ...","B: ...","C: ...","D: ..."],"correct":0,"explanation":"..."}[/QUIZ]

The "correct" field is the 0-based index of the correct option. Only embed ONE quiz block per message. Do NOT use the quiz format for casual comprehension questions — only for formal scored quizzes.

- Keep responses concise and engaging. Avoid walls of text — break things into short paragraphs or bullet points.
- Use markdown formatting: **bold**, \`code\`, ## headings, bullet lists
- You may use emojis sparingly to keep things friendly`;
}

// Get chat history for a lesson
router.get('/history/:lessonId', requireAuth, (req, res) => {
  const { lessonId } = req.params;
  const messages = db.prepare(
    `SELECT role, content, created_at FROM messages
     WHERE user_id = ? AND lesson_id = ? AND role != 'system'
     ORDER BY created_at ASC`
  ).all(req.session.userId, lessonId);
  res.json({ messages });
});

// Send a message
router.post('/message', requireAuth, async (req, res) => {
  const { lessonId, content } = req.body;
  if (!lessonId || !content?.trim())
    return res.status(400).json({ error: 'lessonId and content are required.' });

  const openai = getOpenAI();
  if (!openai) {
    return res.status(503).json({
      error: 'Groq API key not configured. Please add your GROQ_API_KEY secret in Replit.',
    });
  }

  const lesson = getLessonById(lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

  const user = db.prepare('SELECT id, username, skill_level FROM users WHERE id = ?').get(req.session.userId);

  // Save user message
  db.prepare('INSERT INTO messages (user_id, lesson_id, role, content) VALUES (?, ?, ?, ?)')
    .run(req.session.userId, lessonId, 'user', content.trim());

  // Mark lesson as in_progress if not already
  const existing = db.prepare('SELECT status FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
    .get(req.session.userId, lessonId);
  if (!existing) {
    db.prepare('INSERT INTO lesson_progress (user_id, lesson_id, status, started_at) VALUES (?, ?, ?, ?)')
      .run(req.session.userId, lessonId, 'in_progress', new Date().toISOString());
  }

  // Build conversation history
  const history = db.prepare(
    `SELECT role, content FROM messages
     WHERE user_id = ? AND lesson_id = ?
     ORDER BY created_at ASC
     LIMIT 40`
  ).all(req.session.userId, lessonId);

  const systemPrompt = buildSystemPrompt(lesson, user, user.skill_level);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Save assistant response
    db.prepare('INSERT INTO messages (user_id, lesson_id, role, content) VALUES (?, ?, ?, ?)')
      .run(req.session.userId, lessonId, 'assistant', reply);

    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI is temporarily unavailable. Please try again.' });
  }
});

// Start a lesson — get opening message from Kai
router.post('/start', requireAuth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ error: 'lessonId required.' });

  const openai = getOpenAI();
  if (!openai) {
    return res.status(503).json({
      error: 'Groq API key not configured.',
    });
  }

  const lesson = getLessonById(lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

  const user = db.prepare('SELECT id, username, skill_level FROM users WHERE id = ?').get(req.session.userId);

  // Check if we already have messages for this lesson
  const existing = db.prepare('SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND lesson_id = ? AND role != ?')
    .get(req.session.userId, lessonId, 'system');

  if (existing.count > 0) {
    return res.json({ alreadyStarted: true });
  }

  const systemPrompt = buildSystemPrompt(lesson, user, user.skill_level);
  const openingPrompt = `Introduce yourself briefly and begin teaching "${lesson.title}" to ${user.username}. Start with an engaging hook or question to get them thinking. Keep it concise and welcoming.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: openingPrompt },
      ],
      max_tokens: 600,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;

    db.prepare('INSERT INTO messages (user_id, lesson_id, role, content) VALUES (?, ?, ?, ?)')
      .run(req.session.userId, lessonId, 'assistant', reply);

    db.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, started_at)
       VALUES (?, ?, 'in_progress', ?)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = 'in_progress', started_at = COALESCE(started_at, excluded.started_at)`
    ).run(req.session.userId, lessonId, new Date().toISOString());

    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI is temporarily unavailable.' });
  }
});

export default router;
