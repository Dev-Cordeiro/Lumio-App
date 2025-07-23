import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, /* outros módulos */],
  controllers: [UsersController /*, seus outros controllers */],
  providers: [/* serviços */],
})
export class UsersModule {}
