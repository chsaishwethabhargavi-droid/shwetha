import express from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Recommendation from '../models/Recommendation.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('API is working with MongoDB!');
});


router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role });
  await user.save();
  res.json({ message: 'Registered successfully' });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ message: 'Login successful', user: { name: user.name, email: user.email, role: user.role } });
});

router.post('/recommendations', async (req, res) => {
  const { email, data } = req.body;
  const rec = new Recommendation({ email, data });
  await rec.save();
  res.json({ message: 'Recommendation saved' });
});


router.get('/recommendations/:email', async (req, res) => {
  const { email } = req.params;
  const recs = await Recommendation.find({ email });
  res.json(recs);
});

export default router;
