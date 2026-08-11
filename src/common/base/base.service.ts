import { Injectable } from '@nestjs/common';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EntityNotFoundException } from '../exceptions';

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  protected constructor(protected readonly repository: Repository<T>) {}

  protected get entityName(): string {
    return this.repository.metadata.name;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async list(): Promise<T[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as never,
    });

    if (!entity) {
      throw new EntityNotFoundException(this.entityName, id);
    }

    return entity;
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findById(id);

    await this.repository.remove(entity);
  }

  async findOne(filter: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(filter);
  }
}
