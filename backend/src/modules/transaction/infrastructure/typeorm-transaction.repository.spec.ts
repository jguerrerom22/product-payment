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
            createQueryBuilder: jest.fn(),
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

  describe('findAll', () => {
    it('should call createQueryBuilder with filters', async () => {
      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(typeormRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

      const filters = {
        status: 'APPROVED',
        customer_id: 'cust-1',
        start_date: new Date(),
        end_date: new Date(),
      };

      await repository.findAll(filters);

      expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('transaction.product', 'product');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('transaction.customer', 'customer');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.status = :status', { status: filters.status });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.customer_id = :customer_id', { customer_id: filters.customer_id });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.created_at >= :start_date', { start_date: filters.start_date });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.created_at <= :end_date', { end_date: filters.end_date });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('transaction.created_at', 'DESC');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });
});
