import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';

import { GrpcController } from '../common';

import type { CreateOrderRequest, ListOrderRequest } from './interfaces';

import { OrderService } from './order.service';

import type { EntityIdRequest } from '../common';

@Controller()
@GrpcController('orderService')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async create(@Payload() request: CreateOrderRequest) {
    return await this.orderService.create(request);
  }

  async getById(@Payload() request: EntityIdRequest) {
    return await this.orderService.findById(request.id);
  }

  async delete(@Payload() request: EntityIdRequest): Promise<void> {
    await this.orderService.delete(request.id);
  }

  async list(@Payload() request: ListOrderRequest) {
    return this.orderService.listOrders(request);
  }
}
