import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderProto } from 'microservices-proto';
import { BaseService } from '../common';

import { Order } from './entities';
import { OrderMapper } from './order.mapper';
import { OrderReferenceValidatorService } from './order-reference-validator.service';

import { OutboxService } from '../outbox';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    repository: Repository<Order>,

    private readonly referenceValidator: OrderReferenceValidatorService,
    private readonly outboxService: OutboxService,
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

    const order = await this.repository.manager.transaction(async (manager) => {
      const created = manager.create(Order, {
        userId: request.userId,
        productId: request.productId,
        quantity: request.quantity,
        totalAmount: product.price * request.quantity,
      });
      const saved = await manager.save(created);

      await this.outboxService.enqueue(manager, 'order.created', {
        orderId: saved.id,
        userId: saved.userId,
        totalAmount: saved.totalAmount,
        createdAt: saved.createdAt.toISOString(),
      });

      return saved;
    });

    this.logger.log(`Order ${order.id} created successfully`);

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
    this.logger.log(`Deleting order ${orderId}`);

    const order = await this.findById(orderId);

    await this.repository.manager.transaction(async (manager) => {
      await manager.softDelete(Order, orderId);

      await this.outboxService.enqueue(manager, 'order.deleted', {
        orderId: order.id,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
      });
    });

    this.logger.log(`Order ${orderId} deleted successfully`);
  }
}
