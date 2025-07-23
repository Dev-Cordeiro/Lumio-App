import amqp from 'amqplib';

export async function sendToQueue(queue: string, msg: any) {
  const conn = await amqp.connect('amqp://rabbitmq');
  const channel = await conn.createChannel();
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
  setTimeout(() => { conn.close(); }, 500);
} 