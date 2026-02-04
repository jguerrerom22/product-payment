import { Product } from './product.entity';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  // For seeding
  save(product: Product): Promise<Product>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
