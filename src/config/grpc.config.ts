import { GRPC_PACKAGE, PROTO_PATH } from '../common';

export const grpcConfig = {
  package: GRPC_PACKAGE.ORDER,
  protoPath: PROTO_PATH.ORDER,
  url: process.env.GRPC_URL,
} as const;
