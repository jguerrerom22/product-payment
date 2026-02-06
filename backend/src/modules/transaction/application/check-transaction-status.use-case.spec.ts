import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateDeliveryUseCase } from '../../delivery/application/create-delivery.use-case';
import { PAYMENT_GATEWAY_PROVIDER } from '../../payment/domain/payment-gateway.interface';
import { PRODUCT_REPOSITORY } from '../../product/domain/product.repository';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import { CheckTransactionStatusUseCase } from './check-transaction-status.use-case';

describe('CheckTransactionStatusUseCase', () => {
  let useCase: CheckTransactionStatusUseCase;
  let transactionRepository: any;
  let productRepository: any;
  let paymentGateway: any;
  let createDeliveryUseCase: any;

  beforeEach(async () => {
    transactionRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    productRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    paymentGateway = {
      getTransactionStatus: jest.fn(),
    };
    createDeliveryUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckTransactionStatusUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: transactionRepository,
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
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

    useCase = module.get<CheckTransactionStatusUseCase>(CheckTransactionStatusUseCase);
  });

  it('should throw NotFoundException if transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('some-id')).rejects.toThrow(NotFoundException);
  });

  it('should update status and decrease stock when status changes to APPROVED', async () => {
    const mockTransaction = {
      id: 'tx_1',
      product_id: 1,
      amount: 1000,
      status: TransactionStatus.PENDING,
      payment_gateway_id: 'gateway_1',
      customer_id: 'cust_1',
      delivery_info: {
        address: 'Calle 123',
        city: 'Bogotá',
        region: 'Cundinamarca',
        country: 'Colombia',
        postalCode: '110111',
      },
    } as any as Transaction;

    const mockPaymentGatewayResponse = {
      id: 'gateway_1',
      status: 'APPROVED',
      currency: 'COP',
      amount_in_cents: 1000,
    };

    const mockProduct = { id: 1, stock: 10 };

    transactionRepository.findById.mockResolvedValue(mockTransaction);
    paymentGateway.getTransactionStatus.mockResolvedValue(mockPaymentGatewayResponse);
    productRepository.findById.mockResolvedValue(mockProduct);
    transactionRepository.save.mockImplementation((t: Transaction) => Promise.resolve(t));

    const result = await useCase.execute('tx_1');

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(productRepository.save).toHaveBeenCalled();
    expect(mockProduct.stock).toBe(9);
    expect(transactionRepository.save).toHaveBeenCalled();
  });

  it('should not update stock if status was already APPROVED', async () => {
    const mockTransaction = {
      id: 'tx_1',
      product_id: 1,
      status: TransactionStatus.APPROVED,
      payment_gateway_id: 'gateway_1',
    } as any as Transaction;

    const mockPaymentGatewayResponse = {
      id: 'gateway_1',
      status: 'APPROVED',
      currency: 'COP',
      amount_in_cents: 1000,
    };

    transactionRepository.findById.mockResolvedValue(mockTransaction);
    paymentGateway.getTransactionStatus.mockResolvedValue(mockPaymentGatewayResponse);

    const result = await useCase.execute('tx_1');

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });
});
