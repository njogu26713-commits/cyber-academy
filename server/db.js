import mongoose from 'mongoose';

// ── Connection ────────────────────────────────────────────────────────────────

export let dbAvailable = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — running in demo mode (no persistence).');
    return;
  }
  try {
    await mongoose.connect(uri);
    dbAvailable = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️  Running in demo mode (no persistence).');
  }
}

// ── Schemas & Models ──────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  skillLevel:   { type: String, default: 'beginner' },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: String, required: true },
  role:     { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content:  { type: String, required: true },
}, { timestamps: true });
messageSchema.index({ userId: 1, lessonId: 1, createdAt: 1 });

const lessonProgressSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId:    { type: String, required: true },
  status:      { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  startedAt:   { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const quizResultSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: String, required: true },
  question: { type: String, required: true },
  correct:  { type: Boolean, required: true },
}, { timestamps: true });
quizResultSchema.index({ userId: 1, lessonId: 1 });

export const User           = mongoose.model('User',           userSchema);
export const Message        = mongoose.model('Message',        messageSchema);
export const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
export const QuizResult     = mongoose.model('QuizResult',     quizResultSchema);
