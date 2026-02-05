import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../domain/customer.entity';
import { CustomerRepository } from '../domain/customer.repository';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async save(customer: Customer): Promise<Customer> {
    return this.repository.save(customer);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.repository.findOne({ where: { id } });
  }
}
