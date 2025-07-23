import * as amqp from 'amqplib';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '.env') }); // .env do diretório src/workers
dotenv.config(); // Carregar do .env na raiz

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

// Debug: Mostrar se a API key está configurada
console.log('🔑 GOOGLE_PLACES_API_KEY:', GOOGLE_PLACES_API_KEY ? '✅ Configurada' : '❌ Não configurada');
if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ Erro: GOOGLE_PLACES_API_KEY não configurada!');
  process.exit(1);
}

type GooglePlacesResult = {
  results: Array<{
    geometry: { location: { lat: number; lng: number } };
    place_id: string;
    formatted_address: string;
    photos?: Array<{ photo_reference: string }>;
  }>;
};

interface WaypointCorrigido extends Record<string, any> {
  photoUrl?: string | undefined;
}

function getPhotoUrl(photoReference: string): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}

async function corrigirWaypoints(waypoints: any[], cidadeRoteiro?: string): Promise<WaypointCorrigido[]> {
  console.log('Waypoints recebidos para validação:', JSON.stringify(waypoints, null, 2));
  console.log('Cidade do roteiro:', cidadeRoteiro);
  const corrigidos: WaypointCorrigido[] = [];
  for (const wp of waypoints) {
    try {
      console.log(`🔍 Buscando coordenadas para: ${wp.name}`);
      // Usar o nome do local + cidade e estado para busca mais precisa
      // Exemplo: "Shopping Capim Dourado Palmas TO"
      const query = cidadeRoteiro ? `${wp.name} ${cidadeRoteiro.replace(' - ', ' ')}` : wp.name;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`;
      console.log(`🌐 URL da busca: ${url}`);
      const res = await fetch(url);
      const data = (await res.json()) as GooglePlacesResult;
      console.log(`📊 Resultados encontrados: ${data.results?.length || 0}`);
      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        console.log(`✅ Local encontrado: ${place.formatted_address} (${place.geometry.location.lat}, ${place.geometry.location.lng})`);
        let photoUrl: string | undefined = undefined;
        if (place.photos && place.photos.length > 0) {
          photoUrl = getPhotoUrl(place.photos[0].photo_reference);
        }
        corrigidos.push({
          ...wp,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          placeId: place.place_id,
          address: place.formatted_address,
          photoUrl: photoUrl,
        });
      } else {
        console.log(`❌ Local não encontrado: ${wp.name}`);
        // Tentar busca sem cidade como fallback
        if (cidadeRoteiro) {
          console.log(`🔄 Tentando busca sem cidade para: ${wp.name}`);
          const fallbackUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(wp.name)}&key=${GOOGLE_PLACES_API_KEY}`;
          const fallbackRes = await fetch(fallbackUrl);
          const fallbackData = (await fallbackRes.json()) as GooglePlacesResult;
          if (fallbackData.results && fallbackData.results.length > 0) {
            const place = fallbackData.results[0];
            console.log(`✅ Local encontrado (fallback): ${place.formatted_address}`);
            let photoUrl: string | undefined = undefined;
            if (place.photos && place.photos.length > 0) {
              photoUrl = getPhotoUrl(place.photos[0].photo_reference);
            }
            corrigidos.push({
              ...wp,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              placeId: place.place_id,
              address: place.formatted_address,
              photoUrl: photoUrl,
            });
          } else {
            console.log(`❌ Local não encontrado mesmo com fallback: ${wp.name}`);
            corrigidos.push(wp);
          }
        } else {
          corrigidos.push(wp);
        }
      }
    } catch (e) {
      console.error(`❌ Erro ao buscar local ${wp.name}:`, e);
      corrigidos.push(wp);
    }
  }
  console.log('Waypoints após validação:', JSON.stringify(corrigidos, null, 2));
  return corrigidos;
}

async function main() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue('roteiro-validacao', { durable: true });
  await channel.assertQueue('roteiro-pronto', { durable: true });

  console.log('🚦 Worker Validação aguardando roteiros em roteiro-validacao...');

  channel.consume('roteiro-validacao', async (msg) => {
    if (msg) {
      try {
          const data = JSON.parse(msg.content.toString()) as {
                 place: any;
                 preferences: any;
                 userId: string;
                 roteiro: any;
               };        
          if (data.roteiro && Array.isArray(data.roteiro.waypoints)) {
          console.log('🔎 Validando waypoints do roteiro:', data.roteiro.title);
          // Extrair a cidade do roteiro (pode estar em location, cidade, ou outro campo)
          let cidadeRoteiro = data.roteiro.location || data.roteiro.cidade || data.place?.city || data.place?.state;
          
          // Limpar e formatar a cidade para pegar "Cidade - Estado" (ex: "Palmas - TO")
          if (cidadeRoteiro && typeof cidadeRoteiro === 'string') {
            const partes = cidadeRoteiro.split(',');
            if (partes.length >= 2) {
              const cidade = partes[0].trim();
              const estado = partes[1].trim().split(' ')[0]; // Pega apenas a sigla do estado
              cidadeRoteiro = `${cidade} - ${estado}`;
            } else {
              cidadeRoteiro = partes[0].trim();
            }
          }
          
          console.log('Cidade extraída do roteiro:', cidadeRoteiro);
          data.roteiro.waypoints = await corrigirWaypoints(data.roteiro.waypoints, cidadeRoteiro);
          console.log('Waypoints prontos para envio:', JSON.stringify(data.roteiro.waypoints, null, 2));
        }
        channel.sendToQueue('roteiro-pronto', Buffer.from(JSON.stringify(data)));
        channel.ack(msg);
        console.log('✅ Roteiro validado enviado para roteiro-pronto!');
      } catch (e) {
        console.error('❌ Erro ao validar waypoints:', e);
        channel.nack(msg, false, true);
      }
    }
  });
}

main().catch((err) => {
  console.error('Erro fatal no worker-validacao:', err);
  process.exit(1);
}); 