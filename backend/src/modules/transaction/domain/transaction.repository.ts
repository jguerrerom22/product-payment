import { Transaction } from './transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  // For idempotency check if needed
  findByWompiId(wompiId: string): Promise<Transaction | null>;
}

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
