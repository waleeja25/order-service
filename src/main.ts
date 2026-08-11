import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { grpcConfig } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: grpcConfig,
    },
  );

  await app.listen();

  console.log('Catalog Service is running');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
