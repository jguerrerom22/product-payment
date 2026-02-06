import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './domain/delivery.entity';
import { DELIVERY_REPOSITORY } from './domain/delivery.repository';
import { TypeOrmDeliveryRepository } from './infrastructure/typeorm-delivery.repository';
import { CreateDeliveryUseCase } from './application/create-delivery.use-case';
import { DeliveryController } from './infrastructure/delivery.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  controllers: [DeliveryController],
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useClass: TypeOrmDeliveryRepository,
    },
    CreateDeliveryUseCase,
  ],
  exports: [CreateDeliveryUseCase],
})
export class DeliveryModule {}
