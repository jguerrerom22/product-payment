import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../domain/delivery.entity';
import { DeliveryRepository } from '../domain/delivery.repository';

@Injectable()
export class TypeOrmDeliveryRepository implements DeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly repository: Repository<Delivery>,
  ) {}

  async save(delivery: Delivery): Promise<Delivery> {
    return this.repository.save(delivery);
  }

  async findByCustomerId(customerId: string): Promise<Delivery[]> {
    return this.repository.find({
      where: { customer_id: customerId },
      relations: ['transaction', 'transaction.product'],
      order: { created_at: 'DESC' },
    });
  }
}
