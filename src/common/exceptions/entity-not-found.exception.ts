import { DomainException } from './domain.exception';

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: number) {
    super('ENTITY_NOT_FOUND', `${entityName} with id ${id} not found`);
  }
}
