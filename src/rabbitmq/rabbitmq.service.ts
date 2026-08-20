import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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

  publishOrderCreated(data: OrderCreatedEvent): void {
    this.rabbitMQClient.emit(RABBITMQ_ROUTING_KEYS.ORDER_CREATED, data);
    console.log('Order-event created');
  }

  publishOrderDeleted(data: OrderDeletedEvent): void {
    this.rabbitMQClient.emit(RABBITMQ_ROUTING_KEYS.ORDER_DELETED, data);
    console.log('Order-event deleted');
  }
}
