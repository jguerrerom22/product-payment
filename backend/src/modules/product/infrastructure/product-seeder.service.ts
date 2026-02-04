import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProductRepository, PRODUCT_REPOSITORY } from '../domain/product.repository';
import { Product } from '../domain/product.entity';
import { dummyProducts } from './products.data';
@Injectable()
export class ProductSeederService {
  private readonly logger = new Logger(ProductSeederService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async seed() {
    const products = await this.productRepository.findAll();
    if (products.length > 0) {
      this.logger.log('Products already seeded, skipping...');
      return;
    }

    for (const p of dummyProducts) {
      await this.productRepository.save(p as Product);
    }
    this.logger.log(`Seeded ${dummyProducts.length} dummy products.`);
  }
}
