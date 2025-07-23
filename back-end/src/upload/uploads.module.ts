import { Module } from '@nestjs/common';
import { UploadController } from './uploads.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule /* outros módulos */],
  controllers: [UploadController /*, seus outros controllers */],
  providers: [
    /* serviços */
  ],
})
export class UploadModule {}
