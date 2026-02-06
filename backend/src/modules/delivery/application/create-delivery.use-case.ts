import { Inject, Injectable } from '@nestjs/common';
import { Delivery, DeliveryStatus } from '../domain/delivery.entity';
import { DELIVERY_REPOSITORY, DeliveryRepository } from '../domain/delivery.repository';

export interface CreateDeliveryDto {
  transactionId: string;
  customerId: string;
  deliveryInfo: {
    address: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(dto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = new Delivery();
    delivery.transaction_id = dto.transactionId;
    delivery.customer_id = dto.customerId;
    delivery.address = dto.deliveryInfo.address;
    delivery.city = dto.deliveryInfo.city;
    delivery.region = dto.deliveryInfo.region;
    delivery.country = dto.deliveryInfo.country;
    delivery.postal_code = dto.deliveryInfo.postalCode;
    delivery.status = DeliveryStatus.TO_DELIVER;

    return this.deliveryRepository.save(delivery);
  }
}
