import { Server } from 'socket.io';

let io: Server | null = null;

export function initWebSocket(server: any) {
  io = new Server(server, {
    cors: { 
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });
  
  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado ao WebSocket:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado do WebSocket:', socket.id);
    });
  });
  
  console.log('🚀 WebSocket inicializado com sucesso');
}

export function notifyRoteiroPronto(data: any) {
  if (io) {
    console.log('📢 Emitindo evento "roteiro-pronto" para todos os clientes');
    io.emit('roteiro-pronto', data);
    console.log('✅ Evento "roteiro-pronto" emitido via WebSocket:', data);
  } else {
    console.error('❌ WebSocket não inicializado!');
  }
} 