import { registerAs } from '@nestjs/config';

export const grpcClientsConfig = registerAs('grpcClients', () => ({
  userUrl: process.env.USER_SERVICE_GRPC_URL,
  catalogUrl: process.env.CATALOG_SERVICE_GRPC_URL,
}));
