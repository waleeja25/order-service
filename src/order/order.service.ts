import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { BaseService } from '../common';
import { GRPC_CLIENTS, GRPC_SERVICES } from '../common';
import {
  CreateOrderRequest,
  ListOrderRequest,
  OrderListResponse,
} from './interfaces';

import { Order } from './entities';
import { OrderMapper } from './order.mapper';

import type { UserGrpcService, CatalogGrpcService } from '../common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly userService: UserGrpcService;
  private readonly productService: CatalogGrpcService;

  constructor(
    @InjectRepository(Order)
    repository: Repository<Order>,

    @Inject(GRPC_CLIENTS.USER)
    userClient: ClientGrpc,

    @Inject(GRPC_CLIENTS.CATALOG)
    catalogClient: ClientGrpc,
  ) {
    super(repository);
    this.userService = userClient.getService<UserGrpcService>(
      GRPC_SERVICES.USER,
    );

    this.productService = catalogClient.getService<CatalogGrpcService>(
      GRPC_SERVICES.PRODUCT,
    );
  }

  override async create(request: CreateOrderRequest): Promise<Order> {
    await this.validateUser(request.userId);

    await this.validateProduct(request.productId);

    const order = await super.create({
      userId: request.userId,
      productId: request.productId,
      totalAmount: request.totalAmount,
    });

    return order;
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

  private async validateUser(userId: number): Promise<void> {
    await firstValueFrom(
      this.userService.getById({
        id: userId,
      }),
    );
  }
  private async validateProduct(productId: number): Promise<void> {
    await firstValueFrom(
      this.productService.getById({
        id: productId,
      }),
    );
  }
}
