import { DomainException } from '@microservices/microservice-common';
import { status as GrpcStatus } from '@grpc/grpc-js';

export class ServiceUnavailableException extends DomainException {
  constructor(serviceName: string) {
    super(
      'SERVICE_UNAVAILABLE',
      `${serviceName} is currently unavailable`,
      GrpcStatus.UNAVAILABLE,
    );
  }
}
