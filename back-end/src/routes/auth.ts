import express from 'express';
import { authService } from '../services/authService';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 