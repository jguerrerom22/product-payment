import { Controller, Get, Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../domain/customer.repository';
import { Customer } from '../domain/customer.entity';

@Controller('customers')
export class CustomerController {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }
}
