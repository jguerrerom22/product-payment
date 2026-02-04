import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { PRODUCT_REPOSITORY, ProductRepository } from '../domain/product.repository';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}
