import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { BaseService, ReferencedEntityMissingException } from '../common';
import { GRPC_CLIENTS, GRPC_SERVICES } from '../common';
import {
  CreateOrderRequest,
  ListOrderRequest,
  OrderListResponse,
} from './interfaces';

import { Order } from './entities';
import { OrderMapper } from './order.mapper';

import type {
  UserGrpcService,
  CatalogGrpcService,
  ProductResponse,
} from '../common';

import { status as GrpcStatus } from '@grpc/grpc-js';
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
    const [, product] = await Promise.all([
      this.validateUser(request.userId),
      this.fetchProduct(request.productId),
    ]);

    const order = await super.create({
      userId: request.userId,
      productId: request.productId,
      quantity: request.quantity,
      totalAmount: product.price * request.quantity,
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
  private isGrpcNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === GrpcStatus.NOT_FOUND
    );
  }

  private async validateUser(userId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.userService.getById({
          id: userId,
        }),
      );
    } catch (error) {
      if (this.isGrpcNotFound(error)) {
        throw new ReferencedEntityMissingException('User', userId);
      }

      throw error;
    }
  }

  private async fetchProduct(productId: number): Promise<ProductResponse> {
    try {
      return await firstValueFrom(
        this.productService.getById({ id: productId }),
      );
    } catch (error) {
      if (this.isGrpcNotFound(error)) {
        throw new ReferencedEntityMissingException('Product', productId);
      }
      throw error;
    }
  }
}
