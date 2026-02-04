import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '../domain/transaction.repository';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../product/domain/product.repository';
import { WompiService } from '../../payment/wompi.service'; // We will create this next

import { IsNumber, IsObject, IsNotEmpty, Min, IsInt } from 'class-validator';

export class CreateTransactionDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @IsNotEmpty()
  deliveryInfo: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  paymentInfo: {
    token: string;
    installments: number;
    [key: string]: any;
  };
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
     // In a real ROP, we might separate this, but for now we integrate the call here or in a separate service
    private readonly wompiService: WompiService,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    // 1. Validate Product and Stock
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < 1) {
      throw new BadRequestException('Product out of stock');
    }

    // 2. Create Pending Transaction
    const transaction = new Transaction();
    transaction.product_id = dto.productId;
    transaction.amount = dto.amount;
    transaction.delivery_info = dto.deliveryInfo;
    transaction.status = TransactionStatus.PENDING;
    // Mask sensitive info
    transaction.payment_info = {
      ...dto.paymentInfo,
      token: 'MASKED_TOKEN', 
    };
    
    const savedTransaction = await this.transactionRepository.save(transaction);

    // 3. Initiate Payment with Wompi (or Mock)
    try {
      const paymentResponse = await this.wompiService.createTransaction(
        savedTransaction.id,
        dto.amount,
        dto.paymentInfo.token,
        dto.paymentInfo.installments
      );

      // 4. Update Transaction based on immediate response (if synchronous) or wait for webhook
      // Wompi API usually returns a transaction ID immediately with status PENDING/APPROVED/DECLINED
      
      savedTransaction.wompi_id = paymentResponse.id;
      savedTransaction.status = paymentResponse.status as TransactionStatus;

      if (savedTransaction.status === TransactionStatus.APPROVED) {
        // Decrease stock
        product.stock -= 1;
        await this.productRepository.save(product);
      }
      
      return await this.transactionRepository.save(savedTransaction);

    } catch (error) {
      savedTransaction.status = TransactionStatus.ERROR;
      return await this.transactionRepository.save(savedTransaction);
    }
  }
}
