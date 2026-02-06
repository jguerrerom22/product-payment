import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CreateTransactionUseCase } from '../application/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from '../application/check-transaction-status.use-case';
import { TransactionRepository, TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import { NotFoundException } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';

describe('TransactionController', () => {
  let controller: TransactionController;
  let createTransactionUseCase: CreateTransactionUseCase;
  let checkTransactionStatusUseCase: CheckTransactionStatusUseCase;
  let transactionRepository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CheckTransactionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    createTransactionUseCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    checkTransactionStatusUseCase = module.get<CheckTransactionStatusUseCase>(CheckTransactionStatusUseCase);
    transactionRepository = module.get<TransactionRepository>(TRANSACTION_REPOSITORY);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const dto = { 
        productId: 1, 
        amount: 1000, 
        customerEmail: 'test@example.com', 
        customerName: 'Test User',
        customerPhone: '3001234567',
        deliveryInfo: {
          address: 'Calle 123',
          city: 'Bogota',
          region: 'Cundinamarca',
          country: 'Colombia',
          postalCode: '110111'
        }, 
        paymentInfo: { 
          number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'Test User',
          installments: 1 
        } 
      };
      const result = { id: 'tx_1', status: TransactionStatus.PENDING } as Transaction;
      jest.spyOn(createTransactionUseCase, 'execute').mockResolvedValue(result);

      expect(await controller.create(dto as any)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return all transactions with filters', async () => {
      const transactions = [{ id: 'tx_1' }] as Transaction[];
      const filters = { status: TransactionStatus.APPROVED, customer_id: 'cust_1' };
      // @ts-ignore
      jest.spyOn(transactionRepository, 'findAll').mockResolvedValue(transactions);

      const result = await controller.findMany(
        filters.status,
        filters.customer_id,
        undefined,
        undefined
      );

      expect(result).toEqual(transactions);
      expect(transactionRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a transaction if found', async () => {
      const result = { id: 'tx_1' } as Transaction;
      jest.spyOn(transactionRepository, 'findById').mockResolvedValue(result);

      expect(await controller.findOne('tx_1')).toBe(result);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(transactionRepository, 'findById').mockResolvedValue(null);
      await expect(controller.findOne('tx_1')).rejects.toThrow(NotFoundException);
    });
  });
});
