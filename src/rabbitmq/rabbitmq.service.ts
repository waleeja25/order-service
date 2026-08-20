import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_ROUTING_KEYS } from './constants/rabbitmq.constants';

import { OrderCreatedEvent, OrderDeletedEvent } from './events';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitMQClient: ClientProxy,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMQClient.connect();

    this.logger.log('RabbitMQ connected successfully');
  }

  async publishOrderCreated(data: OrderCreatedEvent): Promise<void> {
    await this.publish(RABBITMQ_ROUTING_KEYS.ORDER_CREATED, data);
  }

  async publishOrderDeleted(data: OrderDeletedEvent): Promise<void> {
    await this.publish(RABBITMQ_ROUTING_KEYS.ORDER_DELETED, data);
  }

  private async publish(routingKey: string, data: unknown): Promise<void> {
    try {
      await firstValueFrom(this.rabbitMQClient.emit(routingKey, data));
    } catch (error) {
      this.logger.error(
        `Failed to publish RabbitMQ event "${routingKey}": ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
