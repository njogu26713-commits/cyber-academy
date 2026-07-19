import mongoose from 'mongoose';

// ── Connection ────────────────────────────────────────────────────────────────

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Please add it as a Replit secret.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
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
