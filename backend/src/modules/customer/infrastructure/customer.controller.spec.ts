import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../domain/customer.repository';

describe('CustomerController', () => {
  let controller: CustomerController;
  let repository: CustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    repository = module.get<CustomerRepository>(CUSTOMER_REPOSITORY);
  });

  it('should return all customers', async () => {
    const customers = [
      { id: '1', full_name: 'John Doe', email: 'john@example.com' },
      { id: '2', full_name: 'Jane Doe', email: 'jane@example.com' },
    ];
    jest.spyOn(repository, 'findAll').mockResolvedValue(customers as any);

    const result = await controller.findAll();

    expect(result).toEqual(customers);
    expect(repository.findAll).toHaveBeenCalled();
  });
});
