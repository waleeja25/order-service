import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({
    type: 'datetime',
    precision: 6,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 6,
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: 'datetime',
    precision: 6,
  })
  deletedAt?: Date;
}
