import { Transaction, TransactionStatus } from './transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByPaymentGatewayId(paymentGatewayId: string): Promise<Transaction | null>;
  findAll(filters: {
    status?: TransactionStatus;
    customer_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<Transaction[]>;
}

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
