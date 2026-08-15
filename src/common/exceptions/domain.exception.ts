import { status as GrpcStatus } from '@grpc/grpc-js';

export abstract class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly grpcStatus: GrpcStatus,
  ) {
    super(message);

    this.name = this.constructor.name;
  }
}
