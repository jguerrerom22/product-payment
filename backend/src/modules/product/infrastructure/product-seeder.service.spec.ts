import { Test, TestingModule } from '@nestjs/testing';
import { ProductSeederService } from './product-seeder.service';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';
import { dummyProducts } from './products.data';

describe('ProductSeederService', () => {
  let service: ProductSeederService;
  let productRepository: any;

  beforeEach(async () => {
    productRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSeederService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
        },
      ],
    }).compile();

    service = module.get<ProductSeederService>(ProductSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed products if none exist', async () => {
    productRepository.findAll.mockResolvedValue([]);
    productRepository.save.mockImplementation((p: any) => Promise.resolve(p));

    await service.seed();

    expect(productRepository.findAll).toHaveBeenCalled();
    expect(productRepository.save).toHaveBeenCalledTimes(dummyProducts.length);
  });

  it('should not seed products if some already exist', async () => {
    productRepository.findAll.mockResolvedValue([{ id: 1 }]);

    await service.seed();

    expect(productRepository.findAll).toHaveBeenCalled();
    expect(productRepository.save).not.toHaveBeenCalled();
  });
});
