import { registerAs } from '@nestjs/config';

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  notificationQueue: process.env.RABBITMQ_NOTIFICATION_QUEUE,
}));
