import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const ADMIN_EMAIL = 'admin@pulse.com';
const ADMIN_PASSWORD = 'password123';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

export default router;