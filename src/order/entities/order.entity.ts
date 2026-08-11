import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../common';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({
    type: 'int',
  })
  @Index()
  userId!: number;

  @Column({
    type: 'int',
  })
  @Index()
  productId!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount!: number;
}
