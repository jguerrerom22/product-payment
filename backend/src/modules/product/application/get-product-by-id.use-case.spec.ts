import { Test, TestingModule } from '@nestjs/testing';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';
import { NotFoundException } from '@nestjs/common';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let repository: any;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
  });

  it('should return a product if found', async () => {
    const mockProduct = { id: 1, name: 'Product 1' };
    repository.findById.mockResolvedValue(mockProduct);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockProduct);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if product not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
