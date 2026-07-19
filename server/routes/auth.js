import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), email, passwordHash });
    req.session.userId = user._id.toString();
    res.json({ user: { id: user._id, username: user.username, email: user.email, skill_level: user.skillLevel } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username or email already taken.' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  req.session.userId = user._id.toString();
  res.json({ user: { id: user._id, username: user.username, email: user.email, skill_level: user.skillLevel } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated.' });
  const user = await User.findById(req.session.userId).select('username email skillLevel');
  if (!user) return res.status(401).json({ error: 'User not found.' });
  res.json({ user: { id: user._id, username: user.username, email: user.email, skill_level: user.skillLevel } });
});

export default router;
