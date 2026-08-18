import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_ROUTING_KEYS } from './constants/rabbitmq.constants';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitMQClient: ClientProxy,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMQClient.connect();

    console.log('RabbitMQ connected successfully');
  }

  publishOrderCreated(data: { orderId: number; userId: number }): void {
    this.rabbitMQClient.emit(RABBITMQ_ROUTING_KEYS.ORDER_CREATED, data);
    console.log('Order-event created');
  }
}
