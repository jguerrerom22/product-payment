import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Delivery } from '../domain/delivery.entity';
import { Inject } from '@nestjs/common';
import { DELIVERY_REPOSITORY, DeliveryRepository } from '../domain/delivery.repository';

@Controller('deliveries')
export class DeliveryController {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string): Promise<Delivery[]> {
    return this.deliveryRepository.findByCustomerId(customerId);
  }
}
