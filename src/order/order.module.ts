import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ClientsModule.registerAsync([
      {
        name: GRPC_CLIENTS.USER,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE.USER,
            protoPath: PROTO_PATH.USER,
            url: configService.getOrThrow<string>('grpcClients.userUrl'),
          },
        }),
      },
      {
        name: GRPC_CLIENTS.CATALOG,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE.CATALOG,
            protoPath: PROTO_PATH.CATALOG,
            url: configService.getOrThrow<string>('grpcClients.catalogUrl'),
          },
        }),
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderReferenceValidatorService],
  exports: [OrderService],
})
export class OrderModule {}
