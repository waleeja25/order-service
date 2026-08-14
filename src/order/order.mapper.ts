import { OrderProto } from 'microservices-proto';

import { Order } from './entities';

export class OrderMapper {
  static toResponse(order: Order): OrderProto.Order {
    return {
      id: order.id,
      userId: order.userId,
      productId: order.productId,
      quantity: order.quantity,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
