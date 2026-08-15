import { DomainException } from './domain.exception';
import { status as GrpcStatus } from '@grpc/grpc-js';

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: number) {
    super(
      'ENTITY_NOT_FOUND',
      `${entityName} with id ${id} not found`,
      GrpcStatus.NOT_FOUND,
    );
  }
}
