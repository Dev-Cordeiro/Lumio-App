const amqp = require('amqplib');

async function testGeminiWorker() {
  try {
    // Conectar ao RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    // Declarar as filas
    await channel.assertQueue('gerar-roteiro', { durable: true });
    await channel.assertQueue('roteiro-pronto', { durable: true });
    
    // Dados de teste
    const testData = {
      place: {
        name: 'Palmas',
        city: 'Palmas',
        state: 'Tocantins',
        latitude: -10.1831,
        longitude: -48.3336
      },
      preferences: {
        budget: 'R$500',
        duration: '2 dias',
        interests: ['praia', 'gastronomia', 'cultura'],
        groupSize: 2,
        transportation: 'carro'
      }
    };
    
    console.log('Enviando dados de teste para o worker Gemini...');
    console.log('Dados:', JSON.stringify(testData, null, 2));
    
    // Enviar mensagem para a fila
    channel.sendToQueue('gerar-roteiro', Buffer.from(JSON.stringify(testData)));
    
    // Aguardar resposta
    console.log('Aguardando resposta do worker...');
    
    // Consumir uma mensagem da fila de resposta
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: Nenhuma resposta recebida em 30 segundos'));
      }, 30000);
      
      channel.consume('roteiro-pronto', (msg) => {
        if (msg) {
          clearTimeout(timeout);
          const content = JSON.parse(msg.content.toString());
          channel.ack(msg);
          resolve(content);
        }
      });
    });
    
    console.log('\n✅ Resposta recebida do worker Gemini:');
    console.log(JSON.stringify(response, null, 2));
    
    // Verificar se a resposta contém os campos esperados
    if (response.roteiro && response.roteiro.title && response.roteiro.waypoints) {
      console.log('\n✅ Teste passou! O worker Gemini está funcionando corretamente.');
    } else {
      console.log('\n❌ Teste falhou! A resposta não possui a estrutura esperada.');
    }
    
    await connection.close();
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
}

// Executar o teste
testGeminiWorker(); 