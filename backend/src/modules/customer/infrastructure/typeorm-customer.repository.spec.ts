import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCustomerRepository } from './typeorm-customer.repository';
import { Customer } from '../domain/customer.entity';

describe('TypeOrmCustomerRepository', () => {
  let repository: TypeOrmCustomerRepository;
  let typeormRepository: Repository<Customer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmCustomerRepository,
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TypeOrmCustomerRepository>(TypeOrmCustomerRepository);
    typeormRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save a customer', async () => {
    const customer = new Customer();
    jest.spyOn(typeormRepository, 'save').mockResolvedValue(customer);
    expect(await repository.save(customer)).toBe(customer);
  });

  it('should find by email', async () => {
    const customer = new Customer();
    jest.spyOn(typeormRepository, 'findOne').mockResolvedValue(customer);
    expect(await repository.findByEmail('test@example.com')).toBe(customer);
  });

  it('should find by id', async () => {
    const customer = new Customer();
    jest.spyOn(typeormRepository, 'findOne').mockResolvedValue(customer);
    expect(await repository.findById('id-123')).toBe(customer);
  });
});
