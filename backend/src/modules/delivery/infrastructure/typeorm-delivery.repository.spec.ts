import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmDeliveryRepository } from './typeorm-delivery.repository';
import { Delivery } from '../domain/delivery.entity';

describe('TypeOrmDeliveryRepository', () => {
  let repository: TypeOrmDeliveryRepository;
  let typeormRepository: Repository<Delivery>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmDeliveryRepository,
        {
          provide: getRepositoryToken(Delivery),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TypeOrmDeliveryRepository>(TypeOrmDeliveryRepository);
    typeormRepository = module.get<Repository<Delivery>>(getRepositoryToken(Delivery));
  });

  it('should call save', async () => {
    const delivery = { address: 'Calle 1' } as Delivery;
    await repository.save(delivery);
    expect(typeormRepository.save).toHaveBeenCalledWith(delivery);
  });

  it('should call find by customer id', async () => {
    await repository.findByCustomerId('cust-1');
    expect(typeormRepository.find).toHaveBeenCalledWith({
      where: { customer_id: 'cust-1' },
      order: { created_at: 'DESC' },
      relations: ['transaction', 'transaction.product'],
    });
  });
});
