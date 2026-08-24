import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_TOPICS } from './constants';
import { OrderCreatedEvent, OrderDeletedEvent } from './events';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    this.kafkaClient.status.subscribe((status) => {
      this.logger.log(`Kafka producer status: ${status}`);
    });

    await this.kafkaClient.connect();

    this.logger.log('Connected to Kafka');
  }

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.publish(KAFKA_TOPICS.ORDER_CREATED, event);
  }

  async publishOrderDeleted(event: OrderDeletedEvent): Promise<void> {
    await this.publish(KAFKA_TOPICS.ORDER_DELETED, event);
  }

  private async publish(
    topic: string,
    event: OrderCreatedEvent | OrderDeletedEvent,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.kafkaClient.emit(topic, {
          key: String(event.orderId),
          value: event,
        }),
      );
      this.logger.log(`Published Kafka event on topic "${topic}"`);
    } catch (error) {
      this.logger.error(
        `Failed to publish Kafka event on topic "${topic}": ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
