import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './domain/customer.entity';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository';
import { TypeOrmCustomerRepository } from './infrastructure/typeorm-customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: TypeOrmCustomerRepository,
    },
  ],
  exports: [CUSTOMER_REPOSITORY, TypeOrmModule],
})
export class CustomerModule {}
