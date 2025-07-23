import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initWebSocket } from './websocketGateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  
  const server = await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  
  // Inicializar WebSocket com o servidor HTTP do NestJS
  initWebSocket(server);
  
  console.log(`Servidor rodando na porta ${process.env.PORT ?? 3000}`);
}
bootstrap();
