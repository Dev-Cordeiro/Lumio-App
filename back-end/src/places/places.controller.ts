import {
  Controller,
  Post,
  Body,
  OnModuleInit,
  Get,
  Delete,
  Param,
  NotFoundException,
  UseGuards,
  Req,
  InternalServerErrorException,
  Patch,
} from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { notifyRoteiroPronto } from '../websocketGateway';
import { supabase } from '../services/supabaseClient';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/user-request-interface';
import { GenerateRoteiroDto } from '../generate-roteiro.dto';

@Controller('places')
export class PlacesController implements OnModuleInit {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    const channel = await this.rabbitMQService.getChannel();

    // garante que a fila exista e seja durável
    await channel.assertQueue('roteiro-pronto', { durable: true });

    // consome com ack/nack manual
    await channel.consume(
      'roteiro-pronto',
      async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());
          console.log('📨 Roteiro recebido para salvar:', data.roteiro.title);
          const { roteiro, place, preferences, userId } = data;
          const { data: savedRoteiro, error } = await supabase
            .from('roteiros')
            .insert([
              {
                user_id: userId, // ← aqui
                title: roteiro.title,
                location: roteiro.location,
                rating: roteiro.rating,
                reviews: roteiro.reviews,
                price: roteiro.price,
                description: roteiro.description,
                image_url: roteiro.imageUrl,
                waypoints: roteiro.waypoints,
                place,
                preferences,
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (error) {
            console.error('❌ Erro ao salvar roteiro no Supabase:', error);
            throw error;
          }

          console.log('✅ Roteiro salvo no Supabase! ID:', savedRoteiro.id);

          notifyRoteiroPronto({ ...data, savedId: savedRoteiro.id });

          channel.ack(msg);
          console.log('✅ Cliente notificado sobre roteiro pronto!');
        } catch (err) {
          console.error('❌ Erro ao processar roteiro do Gemini:', err);
          channel.nack(msg, false, true);
        }
      },
      { noAck: false },
    );
  }

  // src/places/places.controller.ts
  @UseGuards(JwtAuthGuard)
  @Post('select')
  async gerarRoteiro(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateRoteiroDto,
  ) {
    const userId = req.user.id;
    const place = dto.startLocation; // já existe
    const preferences = dto.preferences; // agora com os campos period, types, etc.

    await this.rabbitMQService.sendToQueue('gerar-roteiro', {
      place,
      preferences,
      userId,
    });

    return { status: 'processing' };
  }

  @Get('roteiros')
  async listarRoteiros() {
    const { data, error } = await supabase
      .from('roteiros')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar roteiros:', error);
      return [];
    }
    return data;
  }

  @Get('roteiros/:id')
  async getRoteiro(@Param('id') id: string) {
    const { data, error } = await supabase
      .from('roteiros')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Roteiro ${id} não encontrado`);
    }
    return data;
  }

  @Delete('roteiros/:id')
  async excluirRoteiro(@Param('id') id: string) {
    const { error } = await supabase.from('roteiros').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir roteiro:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/roteiros')
  async listarMeusRoteiros(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('roteiros')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar meus roteiros:', error);
      throw new InternalServerErrorException();
    }
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('roteiros/:id')
  async updateScheduledAt(
    @Param('id') id: string,
    @Body('scheduled_at') scheduled_at: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // opcional: verificar se o roteiro pertence ao usuário
    const userId = req.user.id;
    // atualiza no Supabase
    const { data, error } = await supabase
      .from('roteiros')
      .update({ scheduled_at })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao agendar roteiro:', error);
      throw new Error('Não foi possível agendar o roteiro.');
    }

    return data;
  }
}
