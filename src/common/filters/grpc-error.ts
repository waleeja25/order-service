import { status as GrpcStatus } from '@grpc/grpc-js';

export interface GrpcErrorPayload {
  code: GrpcStatus;
  message: string;
}

export const grpcError = (
  code: GrpcStatus,
  message: string,
): GrpcErrorPayload => ({ code, message });
