import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { OutboxMessage } from './outbox-message.entity';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { KafkaService } from '../kafka';

const POLL_INTERVAL_MS = 3000;
const BATCH_SIZE = 10;

@Injectable()
export class OutboxService implements OnModuleInit {
  private readonly logger = new Logger(OutboxService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(OutboxMessage)
    private readonly repository: Repository<OutboxMessage>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly kafkaService: KafkaService,
  ) {}

  onModuleInit(): void {
    setInterval(() => {
      if (this.isProcessing) {
        return;
      }

      this.isProcessing = true;
      this.processPending()
        .catch((error) =>
          this.logger.error(
            'Outbox polling failed',
            error instanceof Error ? error.stack : error,
          ),
        )
        .finally(() => {
          this.isProcessing = false;
        });
    }, POLL_INTERVAL_MS);
  }

  async enqueue(
    manager: EntityManager,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await manager.save(OutboxMessage, { eventType, payload });
  }

  private async processPending(): Promise<void> {
    const messages = await this.repository.find({
      order: { createdAt: 'ASC' },
      take: BATCH_SIZE,
    });

    for (const message of messages) {
      await this.publish(message);
    }
  }

  private async publish(message: OutboxMessage): Promise<void> {
    if (
      message.eventType !== 'order.created' &&
      message.eventType !== 'order.deleted'
    ) {
      this.logger.warn(
        `Unknown outbox event type "${message.eventType}" for message ${message.id}, discarding`,
      );
      await this.repository.delete(message.id);
      return;
    }

    const isCreated = message.eventType === 'order.created';

    if (!message.sentToRabbitMq) {
      try {
        if (isCreated) {
          await this.rabbitMQService.publishOrderCreated({
            orderId: message.payload.orderId as number,
            userId: message.payload.userId as number,
          });
        } else {
          await this.rabbitMQService.publishOrderDeleted({
            orderId: message.payload.orderId as number,
          });
        }
        message.sentToRabbitMq = true;
        await this.repository.save(message);
      } catch (error) {
        this.logger.warn(
          `Failed to publish outbox message ${message.id} to RabbitMQ, will retry: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    if (!message.sentToKafka) {
      try {
        if (isCreated) {
          await this.kafkaService.publishOrderCreated({
            orderId: message.payload.orderId as number,
            userId: message.payload.userId as number,
            totalAmount: message.payload.totalAmount as number,
            createdAt: message.payload.createdAt as string,
          });
        } else {
          await this.kafkaService.publishOrderDeleted({
            orderId: message.payload.orderId as number,
            totalAmount: message.payload.totalAmount as number,
            createdAt: message.payload.createdAt as string,
          });
        }
        message.sentToKafka = true;
        await this.repository.save(message);
      } catch (error) {
        this.logger.warn(
          `Failed to publish outbox message ${message.id} to Kafka, will retry: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    if (message.sentToRabbitMq && message.sentToKafka) {
      await this.repository.delete(message.id);
    }
  }
}
