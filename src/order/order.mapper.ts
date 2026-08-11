import { Order } from './entities';
import { OrderResponse } from './interfaces';

export class OrderMapper {
  static toResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      userId: order.userId,
      productId: order.productId,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
