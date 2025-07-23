// src/users/users.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
  InternalServerErrorException,
  Patch,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { supabase } from '../services/supabaseClient';
import { AuthenticatedRequest } from '../auth/types/user-request-interface';
import { UpdateUserDto } from 'src/auth/dto/update.dto';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getMyStats(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;

    const { count, error: countError } = await supabase
      .from('roteiros')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Erro ao contar roteiros:', countError);
      throw new InternalServerErrorException(
        'Não foi possível buscar estatísticas',
      );
    }

    // mock
    const points = 0;
    const wishes = 0;

    return {
      points,
      wishes,
      roteiros: count || 0,
    };
  }

  // MÉTODO PARA ATUALIZAR O PERFIL ATUALIZADO
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // ✅ Removido 'location' da desestruturação
    const { displayName, phoneNumber } = updateUserDto;

    // Monta o objeto com os dados a serem atualizados no Supabase
    const metadataToUpdate = {
      ...req.user.user_metadata, // Mantém os metadados existentes
      full_name: displayName, // Supabase usa 'full_name' nos metadados
      displayName: displayName,
      phone_number: phoneNumber,
      // ✅ Removido 'location' do objeto de atualização
    };

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadataToUpdate,
    });

    if (error) {
      console.error('Erro ao atualizar usuário no Supabase:', error);
      throw new InternalServerErrorException(
        'Não foi possível atualizar o perfil.',
      );
    }

    return {
      message: 'Perfil atualizado com sucesso!',
      user: data.user,
    };
  }
}
