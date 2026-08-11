import { join } from 'path';

export const GRPC_CLIENTS = {
  USER: 'USER_PACKAGE',
  CATALOG: 'CATALOG_PACKAGE',
} as const;

export const GRPC_PACKAGE = {
  USER: 'user',
  CATALOG: 'catalog',
  ORDER: 'order',
} as const;

export const PROTO_PATH = {
  USER: join(process.cwd(), '../microservices-proto/proto/user.proto'),

  CATALOG: join(process.cwd(), '../microservices-proto/proto/catalog.proto'),

  ORDER: join(process.cwd(), '../microservices-proto/proto/order.proto'),
} as const;

export const GRPC_SERVICES = {
  USER: 'UserService',
  PRODUCT: 'ProductService',
  ORDER: 'OrderService',
} as const;

export const GRPC_CONFIG_KEYS = {
  USER_SERVICE_URL: 'grpc.userServiceUrl',
  CATALOG_SERVICE_URL: 'grpc.catalogServiceUrl',
  ORDER_SERVICE_URL: 'grpc.orderServiceUrl',
} as const;
