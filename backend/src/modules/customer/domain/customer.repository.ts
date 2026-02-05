import { Customer } from './customer.entity';

export interface CustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findByEmail(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
}

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';
