import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmProductRepository } from './typeorm-product.repository';
import { Product } from '../domain/product.entity';

describe('TypeOrmProductRepository', () => {
  let repository: TypeOrmProductRepository;
  let typeormRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmProductRepository,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TypeOrmProductRepository>(TypeOrmProductRepository);
    typeormRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should call find with correct order', async () => {
    const mockProducts = [{ id: 1, name: 'Product 1' }] as Product[];
    (typeormRepository.find as jest.Mock).mockResolvedValue(mockProducts);

    const result = await repository.findAll();

    expect(result).toEqual(mockProducts);
    expect(typeormRepository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
  });

  it('should call findOneBy with correct id', async () => {
    const mockProduct = { id: 1, name: 'Product 1' } as Product;
    (typeormRepository.findOneBy as jest.Mock).mockResolvedValue(mockProduct);

    const result = await repository.findById(1);

    expect(result).toEqual(mockProduct);
    expect(typeormRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should call save with correct data', async () => {
    const mockProduct = { name: 'New Product' } as any;
    (typeormRepository.save as jest.Mock).mockResolvedValue({ id: 2, ...mockProduct });

    const result = await repository.save(mockProduct);

    expect(result.id).toBe(2);
    expect(typeormRepository.save).toHaveBeenCalledWith(mockProduct);
  });
});
