import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './domain/customer.entity';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository';
import { TypeOrmCustomerRepository } from './infrastructure/typeorm-customer.repository';

import { CustomerController } from './infrastructure/customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: TypeOrmCustomerRepository,
    },
  ],
  exports: [CUSTOMER_REPOSITORY, TypeOrmModule],
})
export class CustomerModule {}
