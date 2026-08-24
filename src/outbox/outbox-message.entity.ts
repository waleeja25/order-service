import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('outbox_messages')
export class OutboxMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  eventType!: string;

  @Column({ type: 'simple-json' })
  payload!: Record<string, unknown>;

  @Column({ default: false })
  sentToRabbitMq!: boolean;

  @Column({ default: false })
  sentToKafka!: boolean;

  @CreateDateColumn({
    type: 'datetime',
    precision: 6,
  })
  createdAt!: Date;
}
