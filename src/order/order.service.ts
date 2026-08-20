import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderProto } from 'microservices-proto';
import { BaseService } from '../common';

import { Order } from './entities';
import { OrderMapper } from './order.mapper';
import { OrderReferenceValidatorService } from './order-reference-validator.service';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { KafkaService } from '../kafka';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    repository: Repository<Order>,

    private readonly referenceValidator: OrderReferenceValidatorService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly kafkaService: KafkaService,
  ) {
    super(repository);
  }

  override async create(
    request: OrderProto.CreateOrderRequest,
  ): Promise<Order> {
    const [, product] = await Promise.all([
      this.referenceValidator.validateUser(request.userId),
      this.referenceValidator.fetchProduct(request.productId),
    ]);

    const order = await super.create({
      userId: request.userId,
      productId: request.productId,
      quantity: request.quantity,
      totalAmount: product.price * request.quantity,
    });

    this.rabbitMQService.publishOrderCreated({
      orderId: order.id,
      userId: order.userId,
    });

    this.kafkaService.publishOrderCreated({
      orderId: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
    });

    return order;
  }

  async listOrders(
    request: OrderProto.ListOrderRequest,
  ): Promise<OrderProto.OrderListResponse> {
    const page = request.page > 0 ? request.page : 1;

    const limit =
      request.limit > 0 && request.limit <= 100 ? request.limit : 10;

    const query = this.repository
      .createQueryBuilder('order')
      .orderBy('order.id', 'DESC');

    if (request.userId !== undefined) {
      query.andWhere('order.userId = :userId', {
        userId: request.userId,
      });
    }

    if (request.productId !== undefined) {
      query.andWhere('order.productId = :productId', {
        productId: request.productId,
      });
    }

    query.skip((page - 1) * limit).take(limit);

    const [orders, total] = await query.getManyAndCount();

    return {
      data: orders.map((order) => OrderMapper.toResponse(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  override async delete(orderId: number): Promise<void> {
    const order = await this.findById(orderId);
    await this.repository.softDelete(orderId);

    this.rabbitMQService.publishOrderDeleted({
      orderId,
    });

    this.kafkaService.publishOrderDeleted({
      orderId: order.id,
      totalAmount: order.totalAmount,
    });
  }
}
