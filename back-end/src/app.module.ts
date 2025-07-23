import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlacesModule } from './places/places.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/uploads.module'; // 1. Importar o UploadModule

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PlacesModule,
    RabbitMQModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
