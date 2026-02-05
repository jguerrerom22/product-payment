import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiAdapter } from './wompi.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WompiAdapter', () => {
  let adapter: WompiAdapter;
  let configService: ConfigService;

  const mockConfig = {
    PAYMENT_GATEWAY_API_URL: 'https://sandbox.wompi.co/v1',
    PAYMENT_GATEWAY_PUBLIC_KEY: 'pub_test_key',
    PAYMENT_GATEWAY_PRIVATE_KEY: 'prv_test_key',
    PAYMENT_GATEWAY_INTEGRITY_SECRET: 'test_integrity_secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiAdapter,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => (mockConfig as any)[key]),
          },
        },
      ],
    }).compile();

    adapter = module.get<WompiAdapter>(WompiAdapter);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should successfully create a transaction', async () => {
      const reference = 'ref_123';
      const amount = 1500.50;
      const customerEmail = 'test@example.com';
      const cardDetails = {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      };
      const installments = 1;

      // Mock tokenizeCard response
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { id: 'token_123' } },
      });

      // Mock getAcceptanceToken response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            presigned_acceptance: { acceptance_token: 'acc_token_123' },
          },
        },
      });

      // Mock createTransaction response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            id: 'trans_123',
            status: 'PENDING',
            currency: 'COP',
            amount_in_cents: 150050,
          },
        },
      });

      const result = await adapter.createTransaction(
        reference,
        amount,
        customerEmail,
        cardDetails,
        installments
      );

      expect(result).toEqual({
        id: 'trans_123',
        status: 'PENDING',
        currency: 'COP',
        amount_in_cents: 150050,
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if tokenization fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        adapter.createTransaction('ref', 100, 'e@e.com', {} as any, 1)
      ).rejects.toThrow('Could not tokenize credit card');
    });
  });

  describe('getTransactionStatus', () => {
    it('should successfully get transaction status', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            id: 'trans_123',
            status: 'APPROVED',
            currency: 'COP',
            amount_in_cents: 100000,
          },
        },
      });

      const result = await adapter.getTransactionStatus('trans_123');

      expect(result).toEqual({
        id: 'trans_123',
        status: 'APPROVED',
        currency: 'COP',
        amount_in_cents: 100000,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/transactions/trans_123'),
        expect.any(Object)
      );
    });

    it('should throw error if getTransactionStatus fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(adapter.getTransactionStatus('trans_123')).rejects.toThrow();
    });
  });
});
