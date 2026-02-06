import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DELIVERY_REPOSITORY, DeliveryRepository } from '../domain/delivery.repository';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let repository: DeliveryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DELIVERY_REPOSITORY,
          useValue: {
            findByCustomerId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    repository = module.get<DeliveryRepository>(DELIVERY_REPOSITORY);
  });

  it('should return all deliveries for a customer', async () => {
    const deliveries = [
      { id: '1', customer_id: 'cust-1', address: 'Calle 1' },
      { id: '2', customer_id: 'cust-1', address: 'Calle 2' },
    ];
    jest.spyOn(repository, 'findByCustomerId').mockResolvedValue(deliveries as any);

    const result = await controller.findByCustomer('cust-1');

    expect(result).toEqual(deliveries);
    expect(repository.findByCustomerId).toHaveBeenCalledWith('cust-1');
  });
});
