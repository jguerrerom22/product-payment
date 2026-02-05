import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsUseCase } from './get-products.use-case';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let repository: any;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductsUseCase>(GetProductsUseCase);
  });

  it('should return all products', async () => {
    const mockProducts = [{ id: 1, name: 'Product 1' }];
    repository.findAll.mockResolvedValue(mockProducts);

    const result = await useCase.execute();

    expect(result).toEqual(mockProducts);
    expect(repository.findAll).toHaveBeenCalled();
  });
});
