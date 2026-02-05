import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTransactionRepository } from './typeorm-transaction.repository';
import { Transaction } from '../domain/transaction.entity';

describe('TypeOrmTransactionRepository', () => {
  let repository: TypeOrmTransactionRepository;
  let typeormRepository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmTransactionRepository,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TypeOrmTransactionRepository>(TypeOrmTransactionRepository);
    typeormRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should call save with correct data', async () => {
    const mockTransaction = { reference: 'ref1' } as any;
    (typeormRepository.save as jest.Mock).mockResolvedValue({ id: 'tx1', ...mockTransaction });

    const result = await repository.save(mockTransaction);

    expect(result.id).toBe('tx1');
    expect(typeormRepository.save).toHaveBeenCalledWith(mockTransaction);
  });

  it('should call findOne with correct id and relations', async () => {
    const mockTransaction = { id: 'tx1' } as Transaction;
    (typeormRepository.findOne as jest.Mock).mockResolvedValue(mockTransaction);

    const result = await repository.findById('tx1');

    expect(result).toEqual(mockTransaction);
    expect(typeormRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'tx1' },
      relations: ['product'],
    });
  });

  it('should call findOne by payment gateway id', async () => {
    const mockTransaction = { id: 'tx1', payment_gateway_id: 'gw1' } as Transaction;
    (typeormRepository.findOne as jest.Mock).mockResolvedValue(mockTransaction);

    const result = await repository.findByPaymentGatewayId('gw1');

    expect(result).toEqual(mockTransaction);
    expect(typeormRepository.findOne).toHaveBeenCalledWith({
      where: { payment_gateway_id: 'gw1' },
    });
  });
});
