import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '../../customer/domain/customer.entity';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../customer/domain/customer.repository';
import { CreateDeliveryUseCase } from '../../delivery/application/create-delivery.use-case';
import { PAYMENT_GATEWAY_PROVIDER, PaymentGateway } from '../../payment/domain/payment-gateway.interface';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../product/domain/product.repository';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '../domain/transaction.repository';

import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested
} from 'class-validator';

export class DeliveryInfoDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  postalCode: string;
}

export class PaymentInfoDto {
  @IsString()
  @IsNotEmpty()
  @Length(13, 19) // Basic length check for card numbers
  number: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 4)
  cvc: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'exp_month must be 01-12' })
  exp_month: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}$/, { message: 'exp_year must be 2 digits' })
  exp_year: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 150)
  card_holder: string;

  @IsInt()
  @Min(1)
  installments: number;
}

export class CreateTransactionDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo: DeliveryInfoDto;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 20)
  customerPhone: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo: PaymentInfoDto;
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
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
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

        // Create Delivery Record
        await this.createDeliveryUseCase.execute({
          transactionId: savedTransaction.id,
          customerId: customer.id,
          deliveryInfo: {
            address: dto.deliveryInfo.address,
            city: dto.deliveryInfo.city,
            region: dto.deliveryInfo.region,
            country: dto.deliveryInfo.country,
            postalCode: dto.deliveryInfo.postalCode,
          },
        });
      }
      
      return await this.transactionRepository.save(savedTransaction);

    } catch (error) {
      savedTransaction.status = TransactionStatus.ERROR;
      return await this.transactionRepository.save(savedTransaction);
    }
  }
}
