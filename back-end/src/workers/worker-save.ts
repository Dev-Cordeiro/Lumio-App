import * as dotenv from 'dotenv';
import { join } from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config(); // Carregar do .env na raiz

import * as amqp from 'amqplib';
import { createClient } from '@supabase/supabase-js';

// Debug: Mostrar diretório atual e variáveis
console.log('📂 Diretório atual:', process.cwd());
console.log('📂 Diretório do arquivo:', __dirname);
console.log('\n🔍 Variáveis Supabase:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅' : '❌');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!');
  process.exit(1);
}

console.log('🔑 Tentando conectar ao Supabase com:');
console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

interface Roteiro {
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  imageUrl: string;
  waypoints: any[];
}

interface RoteiroData {
  roteiro: Roteiro;
  place: any;
  preferences: any;
  userId: string;
}

async function testarConexaoSupabase() {
  try {
    const { data, error } = await supabase.from('roteiros').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão com Supabase:', error.message);
    if (error.message?.includes('fetch failed')) {
      console.log('💡 Dica: Verifique se a URL do Supabase está correta e acessível');
    }
    return false;
  }
}

async function salvarRoteiro(data: RoteiroData) {
  try {
    const { roteiro, place, preferences, userId } = data;
    // Log dos waypoints recebidos
    console.log('Waypoints recebidos para salvar:', JSON.stringify(roteiro.waypoints, null, 2));
    // Testar conexão antes de tentar salvar
    const conexaoOk = await testarConexaoSupabase();
    if (!conexaoOk) {
      throw new Error('Não foi possível estabelecer conexão com o Supabase');
    }
    console.log('💾 Tentando salvar roteiro:', roteiro.title);
    // Salvar no Supabase
    const { data: savedRoteiro, error } = await supabase
      .from('roteiros')
      .insert([
        {
          title: roteiro.title,
          location: roteiro.location,
          rating: roteiro.rating,
          reviews: roteiro.reviews,
          price: roteiro.price,
          description: roteiro.description,
          image_url: roteiro.imageUrl,
          waypoints: roteiro.waypoints,
          place: place,
          preferences: preferences,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }
    console.log('✅ Roteiro salvo com sucesso! ID:', savedRoteiro.id);
    return savedRoteiro;
  } catch (error) {
    console.error('❌ Erro ao salvar roteiro:', {
      message: error.message,
      details: error.stack,
      hint: error.hint || '',
      code: error.code || ''
    });
    throw error;
  }
}

async function main() {
  try {
    // Testar conexão com Supabase no início
    await testarConexaoSupabase();

    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
    console.log(`🔗 Conectando ao RabbitMQ em: ${rabbitmqUrl}`);
    
    const conn = await amqp.connect(rabbitmqUrl);
    const channel = await conn.createChannel();
    
    // Configurar filas
    await channel.assertQueue('roteiro-pronto', { durable: true });
    await channel.assertQueue('roteiro-salvo', { durable: true });

    console.log('✅ Worker Save conectado ao RabbitMQ e aguardando roteiros...');

    channel.consume('roteiro-pronto', async (msg) => {
      if (msg) {
        try {
          const data: RoteiroData = JSON.parse(msg.content.toString());
          console.log('📨 Roteiro recebido para salvar:', data.roteiro.title);
          
          const savedRoteiro = await salvarRoteiro(data);
          
          // Enviar roteiro salvo de volta ao backend
          channel.sendToQueue('roteiro-salvo', Buffer.from(JSON.stringify({
            ...data,
            savedId: savedRoteiro.id
          })));
          
          channel.ack(msg);
          console.log('✅ Roteiro salvo e enviado de volta ao backend!');
          
        } catch (error) {
          console.error('❌ Erro ao processar roteiro:', error);
          // Se for erro de conexão, não reprocessar imediatamente
          if (error.message?.includes('fetch failed')) {
            setTimeout(() => channel.nack(msg, false, true), 5000);
          } else {
            channel.nack(msg, false, true);
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

main(); 