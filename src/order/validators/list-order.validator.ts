import { OrderProto } from 'microservices-proto';
import { isPositiveInt } from '../../common';

export function validateListOrderRequest(
  request: OrderProto.ListOrderRequest,
): string | void {
  const errors: string[] = [];

  if (!isPositiveInt(request.page)) {
    errors.push('Page must be a positive integer');
  }

  if (!isPositiveInt(request.limit) || request.limit > 100) {
    errors.push('Limit must be a positive integer no greater than 100');
  }

  if (request.userId !== undefined && !isPositiveInt(request.userId)) {
    errors.push('User ID must be a positive integer');
  }

  if (request.productId !== undefined && !isPositiveInt(request.productId)) {
    errors.push('Product ID must be a positive integer');
  }

  if (errors.length) {
    return errors.join('; ');
  }
}
