import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { GRPC_CLIENTS, GRPC_PACKAGE, PROTO_PATH } from '../common';

import { Order } from './entities';
import { OrderService } from './order.service';
import { OrderReferenceValidatorService } from './order-reference-validator.service';

import { OrderController } from './order.controller';

import { RabbitMQModule } from '../rabbitmq';
import { KafkaModule } from '../kafka';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    RabbitMQModule,
    KafkaModule,
    ClientsModule.register([
      {
        name: GRPC_CLIENTS.USER,
        transport: Transport.GRPC,
        options: {
          package: GRPC_PACKAGE.USER,
          protoPath: PROTO_PATH.USER,
          url: '127.0.0.1:50051',
        },
      },
      {
        name: GRPC_CLIENTS.CATALOG,
        transport: Transport.GRPC,
        options: {
          package: GRPC_PACKAGE.CATALOG,
          protoPath: PROTO_PATH.CATALOG,
          url: '127.0.0.1:50052',
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderReferenceValidatorService],
  exports: [OrderService],
})
export class OrderModule {}
