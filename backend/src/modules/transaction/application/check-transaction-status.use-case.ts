import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '../domain/transaction.repository';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../product/domain/product.repository';
import { PaymentGatewayService } from '../../payment/payment-gateway.service';

@Injectable()
export class CheckTransactionStatusUseCase {
  private readonly logger = new Logger(CheckTransactionStatusUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    if (!transaction.payment_gateway_id) {
      this.logger.warn(`Transaction ${transactionId} has no Payment Gateway ID`);
      return transaction;
    }

    // Current status in our DB
    const oldStatus = transaction.status;

    // Fetch current status from Payment Gateway
    const paymentGatewayResult = await this.paymentGatewayService.getTransactionStatus(transaction.payment_gateway_id);
    const newStatus = paymentGatewayResult.status as TransactionStatus;

    if (oldStatus !== newStatus) {
      this.logger.log(`Transaction ${transactionId} status changed from ${oldStatus} to ${newStatus}`);
      
      transaction.status = newStatus;

      // If it changed to APPROVED, handle stock (if it wasn't approved before)
      if (newStatus === TransactionStatus.APPROVED && oldStatus !== TransactionStatus.APPROVED) {
        const product = await this.productRepository.findById(transaction.product_id);
        if (product) {
          product.stock -= 1;
          await this.productRepository.save(product);
          this.logger.log(`Decreased stock for product ${product.id} due to transaction approval`);
        }
      }

      return await this.transactionRepository.save(transaction);
    }

    return transaction;
  }
}
