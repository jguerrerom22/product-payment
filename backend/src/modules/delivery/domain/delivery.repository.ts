import { Delivery } from './delivery.entity';

export interface DeliveryRepository {
  save(delivery: Delivery): Promise<Delivery>;
  findByCustomerId(customerId: string): Promise<Delivery[]>;
}

export const DELIVERY_REPOSITORY = 'DELIVERY_REPOSITORY';
