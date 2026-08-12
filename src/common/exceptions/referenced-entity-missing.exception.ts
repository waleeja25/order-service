import { DomainException } from './domain.exception';

export class ReferencedEntityMissingException extends DomainException {
  constructor(entityName: string, id: number) {
    super(
      'REFERENCED_ENTITY_MISSING',
      `${entityName} with id ${id} does not exist`,
    );
  }
}
