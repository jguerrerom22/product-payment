import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../domain/transaction.entity';
import { TransactionRepository } from '../domain/transaction.repository';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    return this.repository.save(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOne({ where: { id }, relations: ['product'] });
  }

  async findByPaymentGatewayId(paymentGatewayId: string): Promise<Transaction | null> {
    return this.repository.findOne({ where: { payment_gateway_id: paymentGatewayId } });
  }

  async findAll(filters: {
    status?: any;
    customer_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<Transaction[]> {
    const query = this.repository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.customer', 'customer');

    if (filters.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters.customer_id) {
      query.andWhere('transaction.customer_id = :customer_id', { customer_id: filters.customer_id });
    }

    if (filters.start_date) {
      query.andWhere('transaction.created_at >= :start_date', { start_date: filters.start_date });
    }

    if (filters.end_date) {
      query.andWhere('transaction.created_at <= :end_date', { end_date: filters.end_date });
    }

    return query.orderBy('transaction.created_at', 'DESC').getMany();
  }
}
