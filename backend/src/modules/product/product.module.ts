import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './infrastructure/product.controller';
import { Product } from './domain/product.entity';
import { TypeOrmProductRepository } from './infrastructure/typeorm-product.repository';
import { PRODUCT_REPOSITORY } from './domain/product.repository';
import { GetProductsUseCase } from './application/get-products.use-case';
import { GetProductByIdUseCase } from './application/get-product-by-id.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [
    TypeOrmProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: TypeOrmProductRepository,
    },
    GetProductsUseCase,
    GetProductByIdUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
