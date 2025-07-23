const io = require('socket.io-client');

// Conectar ao WebSocket
const socket = io('http://192.168.10.101:3000', {
  transports: ['websocket', 'polling'],
  timeout: 20000
});

console.log('🔌 Conectando ao WebSocket...');

socket.on('connect', () => {
  console.log('✅ Conectado ao WebSocket com sucesso!');
  console.log('ID do socket:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erro ao conectar ao WebSocket:', error);
});

socket.on('roteiro-pronto', (data) => {
  console.log('🔔 Notificação recebida:', data);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Desconectado do WebSocket:', reason);
});

// Manter o script rodando por 30 segundos
setTimeout(() => {
  console.log('⏰ Teste concluído');
  socket.disconnect();
  process.exit(0);
}, 30000);

console.log('⏳ Aguardando notificações por 30 segundos...'); 