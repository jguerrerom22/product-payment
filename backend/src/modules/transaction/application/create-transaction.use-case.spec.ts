import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { ProductRepository, PRODUCT_REPOSITORY } from '../../product/domain/product.repository';
import { TransactionRepository, TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import { PaymentGateway, PAYMENT_GATEWAY_PROVIDER } from '../../payment/domain/payment-gateway.interface';
import { CreateTransactionDto, DeliveryInfoDto, PaymentInfoDto } from './create-transaction.use-case';
import { TransactionStatus } from '../domain/transaction.entity';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../customer/domain/customer.repository';
import { CreateDeliveryUseCase } from '../../delivery/application/create-delivery.use-case';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let productRepository: any;
  let transactionRepository: any;
  let paymentGateway: any;
  let customerRepository: any;
  let createDeliveryUseCase: any;

  beforeEach(async () => {
    productRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    transactionRepository = {
      save: jest.fn(),
    };
    customerRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    paymentGateway = {
      createTransaction: jest.fn(),
    };
    createDeliveryUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: transactionRepository,
        },
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: customerRepository,
        },
        {
          provide: PAYMENT_GATEWAY_PROVIDER,
          useValue: paymentGateway,
        },
        {
          provide: CreateDeliveryUseCase,
          useValue: createDeliveryUseCase,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  const mockDelivery: DeliveryInfoDto = {
    address: 'Calle 123',
    city: 'Bogota',
    region: 'Cundinamarca',
    country: 'Colombia',
    postalCode: '110111',
  };

  const mockPayment: PaymentInfoDto = {
    number: '4242424242424242',
    cvc: '123',
    exp_month: '12',
    exp_year: '25',
    card_holder: 'Test User',
    installments: 1
  };

  it('should throw NotFoundException if product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);
    const dto: CreateTransactionDto = { 
      productId: 1, 
      amount: 100, 
      customerEmail: 'test@example.com', 
      customerName: 'Test User',
      customerPhone: '3001234567',
      deliveryInfo: mockDelivery, 
      paymentInfo: mockPayment 
    };
    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if product is out of stock', async () => {
    productRepository.findById.mockResolvedValue({ id: 1, stock: 0 });
    const dto: CreateTransactionDto = { 
      productId: 1, 
      amount: 100, 
      customerEmail: 'test@example.com', 
      customerName: 'Test User',
      customerPhone: '3001234567',
      deliveryInfo: mockDelivery, 
      paymentInfo: mockPayment 
    };
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should create a transaction and approve it if Payment Gateway approves', async () => {
    const mockProduct = { id: 1, stock: 10, price: 100 };
    productRepository.findById.mockResolvedValue(mockProduct);
    customerRepository.findByEmail.mockResolvedValue(null);
    customerRepository.save.mockImplementation((c: any) => Promise.resolve({ ...c, id: 'cust_1' }));
    transactionRepository.save.mockImplementation((t: any) => Promise.resolve({ ...t, id: 'tx_1' }));
    
    paymentGateway.createTransaction.mockResolvedValue({
      id: 'gateway_1',
      status: 'APPROVED',
      currency: 'COP',
      amount_in_cents: 10000,
    });

    const dto: CreateTransactionDto = { 
      productId: 1, 
      amount: 4500000, 
      customerEmail: 'test@example.com', 
      customerName: 'Test User',
      customerPhone: '3001234567',
      deliveryInfo: mockDelivery, 
      paymentInfo: mockPayment 
    };
    const result = await useCase.execute(dto);

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.payment_gateway_id).toBe('gateway_1');
    expect(result.customer_id).toBe('cust_1');
    expect(productRepository.save).toHaveBeenCalledWith(expect.objectContaining({ stock: 9 }));
    expect(createDeliveryUseCase.execute).toHaveBeenCalled();
  });
});
