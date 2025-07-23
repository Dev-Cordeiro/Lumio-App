import express from 'express';
import { sendToQueue } from '../services/queueService';

const router = express.Router();

router.post('/select', async (req, res) => {
  try {
    const { place, preferences, userId } = req.body;
    await sendToQueue('gerar-roteiro', { place, preferences, userId });
    res.json({ status: 'processing' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar para a fila' });
  }
});

export default router; 