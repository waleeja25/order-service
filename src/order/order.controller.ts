import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { OrderProto } from 'microservices-proto';

import { GrpcController } from '../common';

import { OrderMapper } from './order.mapper';
import { OrderService } from './order.service';

@Controller()
@GrpcController('OrderService')
export class OrderController implements OrderProto.OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  async create(@Payload() request: OrderProto.CreateOrderRequest) {
    return OrderMapper.toResponse(await this.orderService.create(request));
  }

  async getById(@Payload() request: OrderProto.EntityIdRequest) {
    return OrderMapper.toResponse(await this.orderService.findById(request.id));
  }

  async delete(@Payload() request: OrderProto.EntityIdRequest): Promise<void> {
    await this.orderService.delete(request.id);
  }

  async list(@Payload() request: OrderProto.ListOrderRequest) {
    return this.orderService.listOrders(request);
  }
}
