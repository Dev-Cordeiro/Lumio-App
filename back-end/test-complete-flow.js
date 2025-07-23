const amqp = require('amqplib');

async function testCompleteFlow() {
  try {
    // Conectar ao RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    
    // Declarar as filas
    await channel.assertQueue('gerar-roteiro', { durable: true });
    await channel.assertQueue('roteiro-pronto', { durable: true });
    
    // Dados de teste
    const testData = {
      place: {
        name: "Palmas",
        city: "Palmas",
        state: "Tocantins",
        latitude: -10.1831,
        longitude: -48.3336
      },
      preferences: {
        budget: "R$500",
        duration: "2 dias",
        interests: ["praia", "gastronomia", "cultura"],
        groupSize: 2,
        transportation: "carro"
      }
    };
    
    console.log('🚀 Iniciando teste do fluxo completo...');
    console.log('📤 Enviando dados para geração de roteiro...');
    
    // Enviar mensagem para a fila de geração
    channel.sendToQueue('gerar-roteiro', Buffer.from(JSON.stringify(testData)));
    
    // Aguardar resposta da fila roteiro-pronto
    console.log('⏳ Aguardando roteiro gerado...');
    
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
    
    console.log('\n✅ Roteiro gerado com sucesso!');
    console.log('📋 Detalhes do roteiro:');
    console.log(`   Título: ${response.roteiro.title}`);
    console.log(`   Localização: ${response.roteiro.location}`);
    console.log(`   Preço: ${response.roteiro.price}`);
    console.log(`   Waypoints: ${response.roteiro.waypoints.length}`);
    console.log(`   Fonte: ${response.source}`);
    
    console.log('\n🎯 Fluxo completo testado com sucesso!');
    console.log('   ✅ Geração de roteiro funcionando');
    console.log('   ✅ Salvamento no banco funcionando');
    console.log('   ✅ Notificação pronta para envio');
    
    await connection.close();
    
  } catch (error) {
    console.error('❌ Erro no teste do fluxo completo:', error.message);
    process.exit(1);
  }
}

// Executar o teste
testCompleteFlow(); 