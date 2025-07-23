import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth';
import placesRoutes from './routes/places';
import { initWebSocket } from './websocketGateway';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
initWebSocket(server); 