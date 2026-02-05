import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '../domain/transaction.repository';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../product/domain/product.repository';
import { PaymentGateway, PAYMENT_GATEWAY_PROVIDER } from '../../payment/domain/payment-gateway.interface';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../customer/domain/customer.repository';
import { Customer } from '../../customer/domain/customer.entity';

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

  @IsNotEmpty()
  customerEmail: string;

  @IsNotEmpty()
  customerName: string;

  @IsNotEmpty()
  customerPhone: string;

  @IsObject()
  @IsNotEmpty()
  paymentInfo: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
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
    @Inject(PAYMENT_GATEWAY_PROVIDER)
    private readonly paymentGateway: PaymentGateway,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
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

    // 2. Handle Customer
    let customer = await this.customerRepository.findByEmail(dto.customerEmail);
    if (!customer) {
      customer = new Customer();
      customer.email = dto.customerEmail;
      customer.full_name = dto.customerName;
      customer.phone_number = dto.customerPhone;
      customer = await this.customerRepository.save(customer);
    }

    // 3. Create Pending Transaction
    const transaction = new Transaction();
    transaction.product_id = dto.productId;
    transaction.amount = dto.amount;
    transaction.delivery_info = dto.deliveryInfo;
    transaction.status = TransactionStatus.PENDING;
    transaction.customer_id = customer.id;
    transaction.payment_info = {
      card_number: `**** **** **** ${dto.paymentInfo.number.slice(-4)}`,
      card_holder: dto.paymentInfo.card_holder,
    };
    
    const savedTransaction = await this.transactionRepository.save(transaction);

    // 3. Initiate Payment with Payment Gateway
    try {
      const paymentResponse = await this.paymentGateway.createTransaction(
        savedTransaction.id,
        dto.amount,
        dto.customerEmail,
        dto.paymentInfo,
        dto.paymentInfo.installments
      );

      // 4. Update Transaction status
      savedTransaction.payment_gateway_id = paymentResponse.id;
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
