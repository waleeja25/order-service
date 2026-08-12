import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule, getTypeOrmConfig } from './config';
import {
  DatabaseExceptionFilter,
  DomainExceptionFilter,
  GrpcExceptionFilter,
} from './common';

import { OrderModule } from './order/order.module';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AppConfigModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),

    OrderModule,

    HealthModule,
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: GrpcExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
