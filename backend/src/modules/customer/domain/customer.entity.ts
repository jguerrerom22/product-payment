import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '../../transaction/domain/transaction.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 150 })
  full_name: string;

  @Column('varchar', { length: 150, unique: true })
  email: string;

  @Column('varchar', { length: 20 })
  phone_number: string;

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions: Transaction[];
}
