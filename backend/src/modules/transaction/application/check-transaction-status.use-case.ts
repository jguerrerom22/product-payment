import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '../domain/transaction.repository';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../product/domain/product.repository';
import { PaymentGateway, PAYMENT_GATEWAY_PROVIDER } from '../../payment/domain/payment-gateway.interface';
import { CreateDeliveryUseCase } from '../../delivery/application/create-delivery.use-case';

@Injectable()
export class CheckTransactionStatusUseCase {
  private readonly logger = new Logger(CheckTransactionStatusUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(PAYMENT_GATEWAY_PROVIDER)
    private readonly paymentGateway: PaymentGateway,
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
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
    const paymentGatewayResult = await this.paymentGateway.getTransactionStatus(transaction.payment_gateway_id);
    const newStatus = paymentGatewayResult.status as TransactionStatus;

    if (oldStatus !== newStatus) {
      this.logger.log(`Transaction ${transactionId} status changed from ${oldStatus} to ${newStatus}`);
      
      transaction.status = newStatus;

      // If it changed to APPROVED, handle stock and delivery (if it wasn't approved before)
      if (newStatus === TransactionStatus.APPROVED && oldStatus !== TransactionStatus.APPROVED) {
        const product = await this.productRepository.findById(transaction.product_id);
        if (product) {
          product.stock -= 1;
          await this.productRepository.save(product);
          this.logger.log(`Decreased stock for product ${product.id} due to transaction approval`);
        }

        // Create Delivery Record
        const deliveryInfo = transaction.delivery_info;
        await this.createDeliveryUseCase.execute({
          transactionId: transaction.id,
          customerId: transaction.customer_id!,
          deliveryInfo: {
            address: deliveryInfo.address,
            city: deliveryInfo.city,
            region: deliveryInfo.region,
            country: deliveryInfo.country,
            postalCode: deliveryInfo.postalCode,
          },
        });
        this.logger.log(`Created delivery record for transaction ${transaction.id}`);
      }

      return await this.transactionRepository.save(transaction);
    }

    return transaction;
  }
}
