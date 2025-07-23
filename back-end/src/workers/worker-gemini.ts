// src/workers/worker-gemini.ts

import * as dotenv from 'dotenv';
import { join } from 'path';
import * as amqp from 'amqplib';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// ─── Carrega .env ───────────────────────────────────────────────────────────────
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config();

// ─── Variáveis de ambiente ───────────────────────────────────────────────────────
const GEMINI_API_KEY      = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY      = process.env.OPENAI_API_KEY || '';
const RABBITMQ_URL        = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

// ─── Validações básicas ─────────────────────────────────────────────────────────
if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY não configurada — fallback de texto apenas');
}
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY não configurada — não será possível gerar imagens');
  process.exit(1);
}

// ─── Clientes ───────────────────────────────────────────────────────────────────
const genAI   = new GoogleGenerativeAI(GEMINI_API_KEY);
const openai  = new OpenAI({ apiKey: OPENAI_API_KEY });

// ─── Tipos ──────────────────────────────────────────────────────────────────────
interface Place {
  name?: string;
  text?: { primary?: string };
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}
interface Preferences {
  period: string[];       // ["Manhã", "Tarde"]
  types: string[];        // ["Restaurante", …]
  budget: string[];       // opcional, se ainda usa
  company: string[];      // ["Casal", "Família", …]
  budgetValue?: number;   // ex: 500
}
interface Activity {
  title: string;
  description: string;
  duration: string;
  tip?: string;
}
interface Waypoint {
  latitude: number;
  longitude: number;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport';
  activities: Activity[];
  photoUrl?: string;
}
interface Roteiro {
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  imageUrl?: string;
  waypoints: Waypoint[];
}

async function gerarImagem(prompt: string): Promise<string> {
  const sanitized = prompt.replace(/[^a-zA-Z0-9 ,]/g, '').slice(0, 500);
  if (sanitized.length < 10) {
    throw new Error('❌ Prompt inválido para gerar imagem');
  }
  try {
    const resp = await openai.images.generate({ prompt: sanitized, n: 1, size: '512x512' });
    const url  = resp.data?.[0]?.url;
    if (!url) throw new Error('❌ Nenhuma URL retornada');
    return url;
  } catch (err: any) {
    if (err.status === 400) {
      console.warn('⚠️ Prompt rejeitado, usando fallback simples');
      const fallback = 'Photorealistic tourist spot, daytime';
      const r2 = await openai.images.generate({ prompt: fallback, n: 1, size: '256x256' });
      const fu = r2.data?.[0]?.url;
      if (!fu) throw new Error('❌ Nenhuma URL no fallback');
      return fu;
    }
    throw err;
  }
}


// ─── Gera roteiro de texto via Gemini, sem alterar o prompt original ────────────
async function gerarRoteiroGemini(place: Place, preferences: Preferences): Promise<Roteiro> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // <<< PROMPT ORIGINAL SEM ALTERAÇÕES >>>
  const prompt = `
    Gere um roteiro turístico detalhado para ${place.name || place.text?.primary || 'um destino'} em ${place.city || place.state || 'localização desconhecida'}.
    
    Preferências do usuário:
    • Período(s): ${preferences.period.join(', ') || 'Não especificado'}
    • Tipo(s):     ${preferences.types.join(', ') || 'Não especificado'}
    • Orçamento:   ${preferences.budgetValue ? `R$${preferences.budgetValue}` : 'Não especificado'}
    • Companhia:   ${preferences.company.join(', ') || 'Não especificado'}
    
    Por favor, retorne um JSON válido no seguinte formato:
    {
      "title": "Título do roteiro",
      "location": "Localização",
      "rating": 4.5,
      "reviews": 150,
      "price": "R$300/pessoa",
      "description": "Descrição do roteiro",
      "imageUrl": "https://images.unsplash.com/photo-...",
      "waypoints": [
        {
          "latitude": -10.1831,
          "longitude": -48.3336,
          "name": "Nome do local",
          "type": "attraction|restaurant|hotel|transport",
          "activities": [
            {
              "title": "Título da atividade",
              "description": "Descrição da atividade",
              "duration": "1h30",
              "tip": "Dica para o usuário"
            }
          ]
        }
      ]
    }
    
    Certifique-se de que:
    1. O JSON seja válido e bem formatado
    2. As coordenadas sejam realistas para a localização
    3. As atividades sejam práticas e interessantes
    4. O preço seja realista para o orçamento informado
    5. A descrição seja atrativa e informativa
  `;

  // gerar texto
  const result   = await model.generateContent(prompt);
  const response = await result.response;
  const text     = await response.text();
  const jsonRaw  = text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonRaw) {
    throw new Error('Resposta da IA não contém JSON válido');
  }
  const roteiro: Roteiro = JSON.parse(jsonRaw);

  // ─── após JSON, geramos imagens ────────────────────────────────────────────────

   // se nao veio imageUrl, gera
  if (!roteiro.imageUrl) {
    try {
      roteiro.imageUrl = await gerarImagem(`Tourist view of ${roteiro.title}, clear sky`);
    } catch {
      roteiro.imageUrl = 'https://via.placeholder.com/512';
    }
  }

  // 3) waypoints: tenta usar photoUrl do JSON, senão gera
  await Promise.all(roteiro.waypoints.map(async wp => {
    if (!wp.photoUrl) {
      try {
        wp.photoUrl = await gerarImagem(`Tourist spot ${wp.name}, type ${wp.type}`);
      } catch {
        wp.photoUrl = 'https://via.placeholder.com/256';
      }
    }
  }));

  return roteiro;
}

// ─── Worker principal ────────────────────────────────────────────────────────────
async function main() {
  const conn    = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertQueue('gerar-roteiro',    { durable: true });
  await channel.assertQueue('roteiro-validacao',{ durable: true });

  console.log('🚦 Worker Gemini aguardando em gerar-roteiro...');

  channel.consume('gerar-roteiro', async msg => {
    if (!msg) return;
    try {
      const { place, preferences, userId } = JSON.parse(msg.content.toString());
      console.log('📨 Recebido para Gemini:', place, preferences);

      // gera o roteiro (texto + imagens)
      const roteiro = await gerarRoteiroGemini(place, preferences);

      // envia adiante para validação/salvamento
      channel.sendToQueue(
       'roteiro-validacao',
        Buffer.from(JSON.stringify({ place, preferences, userId, roteiro }))
      );
      channel.ack(msg);
      console.log('✅ Enviado para roteiro-validacao');
    } catch (err) {
      console.error('❌ Erro no worker-gemini:', err);
      channel.nack(msg, false, true);
    }
  });
}

main().catch(err => {
  console.error('❌ Falha no worker-gemini:', err);
  process.exit(1);
});
