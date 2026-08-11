import { join } from 'path';

export const GRPC_PACKAGE = {
  ORDER: 'order',
} as const;

export const PROTO_PATH = {
  CATALOG: join(process.cwd(), '../microservices-proto/proto/order.proto'),
} as const;
