// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private configService: ConfigService,private jwtService: JwtService,) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');
    if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_KEY são obrigatórios');
    this.supabase = createClient(url, key);
  }

  async register(email: string, password: string, displayName?: string, phoneNumber?: string) {
  const { data, error } = await this.supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
        phone_number: phoneNumber,
      },
    },
  });

    if (error) throw new Error(error.message);
    return data; // { user, session }
  }


  async login(email: string, password: string) {
  const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const { user, session } = data;

  // Cria o token com os metadados desejados
  const payload = {
    sub: user.id,
    email: user.email,
    user_metadata: user.user_metadata || {},
  };

  const access_token = this.jwtService.sign(payload);

  return { session: { access_token }, user };
  }

}
