import { DomainException } from '@microservices/microservice-common';
import { status as GrpcStatus } from '@grpc/grpc-js';

export class ReferencedEntityMissingException extends DomainException {
  constructor(entityName: string, id: number) {
    super(
      'REFERENCED_ENTITY_MISSING',
      `${entityName} with id ${id} does not exist`,
      GrpcStatus.INVALID_ARGUMENT,
    );
  }
}
