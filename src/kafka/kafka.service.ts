import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
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

  publishOrderCreated(event: OrderCreatedEvent): void {
    this.kafkaClient.emit(KAFKA_TOPICS.ORDER_CREATED, {
      key: String(event.orderId),
      value: event,
    });
  }
  publishOrderDeleted(event: OrderDeletedEvent): void {
    this.kafkaClient.emit(KAFKA_TOPICS.ORDER_DELETED, {
      key: String(event.orderId),
      value: event,
    });
  }
}
