import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [PlacesController],
})
export class PlacesModule {} 