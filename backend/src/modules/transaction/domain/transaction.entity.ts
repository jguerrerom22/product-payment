import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/domain/product.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  // Storing delivery info as JSON B for flexibility
  @Column({ type: 'jsonb' })
  delivery_info: Record<string, any>;

  // Storing masked payment info only (no full CC numbers)
  @Column({ type: 'jsonb', nullable: true })
  payment_info: Record<string, any>;

  @Column({ nullable: true })
  payment_gateway_id: string;

  @CreateDateColumn()
  created_at: Date;
}
