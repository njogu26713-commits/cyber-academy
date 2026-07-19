import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { SQLiteSessionStore } from './sessionStore.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import progressRoutes from './routes/progress.js';
import { curriculum } from './curriculum.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SQLiteSessionStore(),
  secret: process.env.SESSION_SECRET || 'firebox-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/curriculum', (req, res) => {
  res.json({ curriculum });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Serve built frontend in production
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Firebox API running on port ${PORT}`);
});
