import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './app.config';
import databaseConfig from './database.config';
import { rabbitmqConfig } from './rabbitmq.config';
import { grpcClientsConfig } from './grpc-clients.config';
import { kafkaConfig } from './kafka.config';

import { envValidationSchema } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      load: [
        appConfig,
        databaseConfig,
        rabbitmqConfig,
        grpcClientsConfig,
        kafkaConfig,
      ],

      validationSchema: envValidationSchema,
    }),
  ],

  exports: [ConfigModule],
})
export class AppConfigModule {}
