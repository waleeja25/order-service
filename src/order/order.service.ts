import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '../common';

import { ListOrderRequest, OrderListResponse } from './interfaces';

import { Order } from './entities';
import { OrderMapper } from './order.mapper';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    repository: Repository<Order>,
  ) {
    super(repository);
  }

  async listOrders(request: ListOrderRequest): Promise<OrderListResponse> {
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
}
