import { OrderProto } from 'microservices-proto';
import { isPositiveInt } from '../../common';

export function validateCreateOrderRequest(
  request: OrderProto.CreateOrderRequest,
): string | void {
  const errors: string[] = [];

  if (!isPositiveInt(request.userId)) {
    errors.push('User ID must be a positive integer');
  }

  if (!isPositiveInt(request.productId)) {
    errors.push('Product ID must be a positive integer');
  }

  if (!isPositiveInt(request.quantity)) {
    errors.push('Quantity must be a positive integer');
  }

  if (errors.length) {
    return errors.join('; ');
  }
}
