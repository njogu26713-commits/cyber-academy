import express from 'express';
import OpenAI from 'openai';
import { User, Message, LessonProgress } from '../db.js';
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
router.get('/history/:lessonId', requireAuth, async (req, res) => {
  const { lessonId } = req.params;
  const messages = await Message.find({
    userId: req.session.userId,
    lessonId,
    role: { $ne: 'system' },
  }).sort({ createdAt: 1 }).select('role content createdAt');
  res.json({ messages });
});

// Send a message
router.post('/message', requireAuth, async (req, res) => {
  const { lessonId, content, systemContext } = req.body;
  if (!lessonId || !content?.trim())
    return res.status(400).json({ error: 'lessonId and content are required.' });

  const openai = getOpenAI();
  if (!openai) {
    return res.status(503).json({
      error: 'Groq API key not configured. Please add your GROQ_API_KEY secret in Replit.',
    });
  }

  const user = await User.findById(req.session.userId).select('username skillLevel');

  // Save user message
  await Message.create({ userId: req.session.userId, lessonId, role: 'user', content: content.trim() });

  // For non-lesson contexts (e.g. Commands Library), systemContext is supplied by the client
  let systemPrompt;
  if (systemContext) {
    systemPrompt = systemContext;
  } else {
    const lesson = getLessonById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
    // Mark lesson as in_progress if not already started
    await LessonProgress.findOneAndUpdate(
      { userId: req.session.userId, lessonId },
      { $setOnInsert: { status: 'in_progress', startedAt: new Date() } },
      { upsert: true, new: true }
    );
    systemPrompt = buildSystemPrompt(lesson, user, user.skillLevel);
  }

  // Build conversation history (last 40 messages)
  const history = await Message.find({ userId: req.session.userId, lessonId })
    .sort({ createdAt: 1 })
    .limit(40)
    .select('role content');

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
    await Message.create({ userId: req.session.userId, lessonId, role: 'assistant', content: reply });

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
    return res.status(503).json({ error: 'Groq API key not configured.' });
  }

  const lesson = getLessonById(lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

  const user = await User.findById(req.session.userId).select('username skillLevel');

  // Check if we already have messages for this lesson
  const existingCount = await Message.countDocuments({
    userId: req.session.userId,
    lessonId,
    role: { $ne: 'system' },
  });

  if (existingCount > 0) {
    return res.json({ alreadyStarted: true });
  }

  const systemPrompt = buildSystemPrompt(lesson, user, user.skillLevel);
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

    await Message.create({ userId: req.session.userId, lessonId, role: 'assistant', content: reply });

    await LessonProgress.findOneAndUpdate(
      { userId: req.session.userId, lessonId },
      { $set: { status: 'in_progress' }, $setOnInsert: { startedAt: new Date() } },
      { upsert: true }
    );

    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI is temporarily unavailable.' });
  }
});

export default router;
