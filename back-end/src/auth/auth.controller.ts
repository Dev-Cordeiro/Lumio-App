
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedRequest } from './types/user-request-interface';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: AuthDto) {
    const { user, session } = await this.authService.register(
      dto.email,
      dto.password,
      dto.displayName,
      dto.phoneNumber,
    );
    return { user, session };
  }

  @Post('login')
  async login(@Body() dto: AuthDto) {
    const { session, user } = await this.authService.login(dto.email, dto.password);
    return { session, user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const { id, email, user_metadata } = req.user;
    return {
      user: {
        id,
        email,
        user_metadata,
      },
    };
  }


}
