import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { GRPC_CLIENTS, GRPC_PACKAGE, PROTO_PATH } from '../common';

import { Order } from './entities';
import { OrderService } from './order.service';

import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),

    ClientsModule.register([
      {
        name: GRPC_CLIENTS.USER,
        transport: Transport.GRPC,
        options: {
          package: GRPC_PACKAGE.USER,
          protoPath: PROTO_PATH.USER,
          url: 'localhost:50051',
        },
      },
      {
        name: GRPC_CLIENTS.CATALOG,
        transport: Transport.GRPC,
        options: {
          package: GRPC_PACKAGE.CATALOG,
          protoPath: PROTO_PATH.CATALOG,
          url: 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
