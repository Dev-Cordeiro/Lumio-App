import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { supabase } from '../services/supabaseClient';
import { AuthenticatedRequest } from '../auth/types/user-request-interface';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // 'file' é a chave no FormData
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const userId = req.user.id;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Faz o upload para o bucket 'avatars' no Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // Sobrescreve se já existir um com mesmo nome
      });

    if (uploadError) {
      console.error('Erro no upload para o Supabase:', uploadError);
      throw new InternalServerErrorException(
        'Não foi possível fazer o upload da imagem.',
      );
    }

    // Pega a URL pública do arquivo que acabamos de enviar
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return { publicUrl: data.publicUrl };
  }
}
