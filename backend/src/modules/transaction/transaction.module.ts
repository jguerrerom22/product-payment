import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionController } from './infrastructure/transaction.controller';
import { Transaction } from './domain/transaction.entity';
import { TypeOrmTransactionRepository } from './infrastructure/typeorm-transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/transaction.repository';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from './application/check-transaction-status.use-case';
import { PAYMENT_GATEWAY_PROVIDER } from '../payment/domain/payment-gateway.interface';
import { WompiAdapter } from '../payment/infrastructure/wompi.adapter';
import { ProductModule } from '../product/product.module'; // To access ProductRepository
import { CustomerModule } from '../customer/customer.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Transaction]),
    ProductModule,
    CustomerModule,
    DeliveryModule,
  ],
  controllers: [TransactionController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
    CreateTransactionUseCase,
    CheckTransactionStatusUseCase,
    {
      provide: PAYMENT_GATEWAY_PROVIDER,
      useFactory: (configService: ConfigService) => {
        return new WompiAdapter(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TRANSACTION_REPOSITORY], 
})
export class TransactionModule {}
