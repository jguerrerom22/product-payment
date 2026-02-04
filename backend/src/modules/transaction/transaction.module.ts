import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TransactionController } from './infrastructure/transaction.controller';
import { Transaction } from './domain/transaction.entity';
import { TypeOrmTransactionRepository } from './infrastructure/typeorm-transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/transaction.repository';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from './application/check-transaction-status.use-case';
import { PaymentGatewayService } from '../payment/payment-gateway.service';
import { ProductModule } from '../product/product.module'; // To access ProductRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ProductModule,
    ConfigModule,
  ],
  controllers: [TransactionController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
    CreateTransactionUseCase,
    CheckTransactionStatusUseCase,
    PaymentGatewayService,
  ],
  exports: [TRANSACTION_REPOSITORY], 
})
export class TransactionModule {}
