import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Transaction } from '../../transaction/domain/transaction.entity';
import { Customer } from '../../customer/domain/customer.entity';

export enum DeliveryStatus {
  TO_DELIVER = 'TO_DELIVER',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

@Entity('delivery')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transaction_id: string;

  @OneToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'uuid' })
  customer_id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column('varchar', { length: 255 })
  address: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  region: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('varchar', { length: 20 })
  postal_code: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.TO_DELIVER,
  })
  status: DeliveryStatus;

  @CreateDateColumn()
  created_at: Date;
}
