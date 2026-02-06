import { Test, TestingModule } from '@nestjs/testing';
import { CreateDeliveryUseCase, CreateDeliveryDto } from './create-delivery.use-case';
import { DELIVERY_REPOSITORY, DeliveryRepository } from '../domain/delivery.repository';
import { DeliveryStatus } from '../domain/delivery.entity';

describe('CreateDeliveryUseCase', () => {
  let useCase: CreateDeliveryUseCase;
  let repository: DeliveryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDeliveryUseCase,
        {
          provide: DELIVERY_REPOSITORY,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateDeliveryUseCase>(CreateDeliveryUseCase);
    repository = module.get<DeliveryRepository>(DELIVERY_REPOSITORY);
  });

  it('should create and save a new delivery', async () => {
    const dto: CreateDeliveryDto = {
      transactionId: 'tx-123',
      customerId: 'cust-123',
      deliveryInfo: {
        address: 'Calle 123',
        city: 'Bogota',
        region: 'Cundinamarca',
        country: 'Colombia',
        postalCode: '110111',
      },
    };

    const savedDelivery = {
      id: 'del-123',
      ...dto,
      status: DeliveryStatus.PENDING,
    };

    jest.spyOn(repository, 'save').mockResolvedValue(savedDelivery as any);

    const result = await useCase.execute(dto);

    expect(result).toEqual(savedDelivery);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      transaction_id: dto.transactionId,
      customer_id: dto.customerId,
      address: dto.deliveryInfo.address,
      status: DeliveryStatus.PENDING,
    }));
  });
});
