import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, dbAvailable } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import progressRoutes from './routes/progress.js';
import { curriculum } from './curriculum.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (non-fatal if missing)
await connectDB();

// Session store: MongoDB when available, in-memory fallback
const sessionStore = dbAvailable && process.env.MONGODB_URI
  ? MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 7 * 24 * 60 * 60,
      autoRemove: 'native',
    })
  : undefined; // express-session defaults to MemoryStore

app.use(session({
  ...(sessionStore ? { store: sessionStore } : {}),
  secret: process.env.SESSION_SECRET || 'firebox-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/curriculum', (req, res) => {
  res.json({ curriculum });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: dbAvailable, timestamp: new Date().toISOString() });
});

// Serve built frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (DB: ${dbAvailable ? 'MongoDB' : 'in-memory'})`);
});
