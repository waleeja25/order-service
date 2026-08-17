import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { OrderProto } from 'microservices-proto';

import { GrpcController, Validate, validateEntityIdRequest } from '../common';

import { OrderMapper } from './order.mapper';
import { OrderService } from './order.service';
import {
  validateCreateOrderRequest,
  validateListOrderRequest,
} from './validators';

@Controller()
@GrpcController('OrderService')
export class OrderController implements OrderProto.OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  async create(
    @Payload(Validate(validateCreateOrderRequest))
    request: OrderProto.CreateOrderRequest,
  ) {
    return OrderMapper.toResponse(await this.orderService.create(request));
  }

  async getById(
    @Payload(Validate(validateEntityIdRequest))
    request: OrderProto.EntityIdRequest,
  ) {
    return OrderMapper.toResponse(await this.orderService.findById(request.id));
  }

  async delete(
    @Payload(Validate(validateEntityIdRequest))
    request: OrderProto.EntityIdRequest,
  ): Promise<void> {
    await this.orderService.delete(request.id);
  }

  async list(
    @Payload(Validate(validateListOrderRequest))
    request: OrderProto.ListOrderRequest,
  ) {
    return this.orderService.listOrders(request);
  }
}
