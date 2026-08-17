import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

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
    this.rabbitMQClient.emit('order.created', data);
    console.log('Order-event created');
  }
}
