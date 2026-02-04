import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { PRODUCT_REPOSITORY, ProductRepository } from '../domain/product.repository';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
