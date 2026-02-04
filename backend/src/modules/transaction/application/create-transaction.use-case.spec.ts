import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { ProductRepository, PRODUCT_REPOSITORY } from '../../product/domain/product.repository';
import { TransactionRepository, TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import { PaymentGatewayService } from '../../payment/payment-gateway.service';
import { CreateTransactionDto } from './create-transaction.use-case';
import { TransactionStatus } from '../domain/transaction.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let productRepository: ProductRepository;
  let transactionRepository: TransactionRepository;
  let paymentGatewayService: PaymentGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: PaymentGatewayService,
          useValue: {
            createTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    productRepository = module.get<ProductRepository>(PRODUCT_REPOSITORY);
    transactionRepository = module.get<TransactionRepository>(TRANSACTION_REPOSITORY);
    paymentGatewayService = module.get<PaymentGatewayService>(PaymentGatewayService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if product does not exist', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(null);
    const dto: CreateTransactionDto = { 
      productId: 1, 
      amount: 100, 
      customerEmail: 'test@example.com', 
      deliveryInfo: {}, 
      paymentInfo: { 
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'Test User',
        installments: 1 
      } 
    };
    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if product is out of stock', async () => {
    // @ts-ignore
    jest.spyOn(productRepository, 'findById').mockResolvedValue({ id: 1, stock: 0 });
    const dto: CreateTransactionDto = { 
      productId: 1, 
      amount: 100, 
      customerEmail: 'test@example.com', 
      deliveryInfo: {}, 
      paymentInfo: { 
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'Test User',
        installments: 1 
      } 
    };
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should create a transaction and approve it if Payment Gateway approves', async () => {
    const mockProduct = { id: 1, stock: 10, price: 100 };
    // @ts-ignore
    jest.spyOn(productRepository, 'findById').mockResolvedValue(mockProduct);
    // @ts-ignore
    jest.spyOn(transactionRepository, 'save').mockImplementation((t) => Promise.resolve({ ...t, id: 'tx_1' }));
    
    jest.spyOn(paymentGatewayService, 'createTransaction').mockResolvedValue({
      id: 'gateway_1',
      status: 'APPROVED',
      currency: 'COP',
      amount_in_cents: 10000,
    });

    const dto: CreateTransactionDto = { 
      productId: 1, 
      amount: 100, 
      customerEmail: 'test@example.com', 
      deliveryInfo: {}, 
      paymentInfo: { 
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'Test User',
        installments: 1 
      } 
    };
    const result = await useCase.execute(dto);

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.payment_gateway_id).toBe('gateway_1');
    expect(productRepository.save).toHaveBeenCalledWith(expect.objectContaining({ stock: 9 }));
  });
});
