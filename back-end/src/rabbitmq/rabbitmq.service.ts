import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 5000; // 5 segundos

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    if (this.isConnecting) {
      console.log('🔄 Já existe uma tentativa de conexão em andamento...');
      return;
    }

    this.isConnecting = true;

    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
      console.log(`🔗 Tentando conectar ao RabbitMQ em: ${rabbitmqUrl}`);
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Configurar filas
      await this.channel.assertQueue('gerar-roteiro', { durable: true });
      await this.channel.assertQueue('roteiro-pronto', { durable: true });
      await this.channel.assertQueue('roteiro-salvo', { durable: true });

      console.log('✅ RabbitMQ conectado e filas configuradas com sucesso!');
      this.reconnectAttempts = 0;

      // Configurar listeners de eventos
      this.connection.on('error', (err) => {
        console.error('❌ Erro na conexão RabbitMQ:', err.message);
        this.handleDisconnect();
      });

      this.connection.on('close', () => {
        console.log('🔌 Conexão RabbitMQ fechada');
        this.handleDisconnect();
      });

      this.channel.on('error', (err) => {
        console.error('❌ Erro no canal RabbitMQ:', err.message);
      });

      this.channel.on('close', () => {
        console.log('🔌 Canal RabbitMQ fechado');
      });

    } catch (error) {
      console.error('❌ Erro ao conectar com RabbitMQ:', error.message);
      await this.handleDisconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleDisconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error(`❌ Máximo de ${this.MAX_RECONNECT_ATTEMPTS} tentativas de reconexão atingido`);
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts} de ${this.MAX_RECONNECT_ATTEMPTS} em ${this.RECONNECT_INTERVAL/1000}s...`);

    setTimeout(async () => {
      await this.connect();
    }, this.RECONNECT_INTERVAL);
  }

  async getChannel(): Promise<amqp.Channel> {
    if (!this.channel || this.channel.closed) {
      await this.connect();
    }
    return this.channel;
  }

  async sendToQueue(queue: string, msg: any) {
    try {
      if (!this.channel || this.channel.closed) {
        await this.connect();
      }

      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
      console.log(`📨 Mensagem enviada para a fila ${queue}:`, msg);
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para fila ${queue}:`, error.message);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('✅ Conexão RabbitMQ fechada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fechar conexão RabbitMQ:', error.message);
    }
  }
} 