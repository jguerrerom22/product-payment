import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { GetProductsUseCase } from '../application/get-products.use-case';
import { GetProductByIdUseCase } from '../application/get-product-by-id.use-case';
import { Product } from '../domain/product.entity';

describe('ProductController', () => {
  let controller: ProductController;
  let getProductsUseCase: GetProductsUseCase;
  let getProductByIdUseCase: GetProductByIdUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GetProductsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetProductByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    getProductsUseCase = module.get<GetProductsUseCase>(GetProductsUseCase);
    getProductByIdUseCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result: Product[] = [{ id: 1, name: 'Test', price: 100 } as Product];
      jest.spyOn(getProductsUseCase, 'execute').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result: Product = { id: 1, name: 'Test', price: 100 } as Product;
      jest.spyOn(getProductByIdUseCase, 'execute').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
    });
  });
});
