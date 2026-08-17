export const RABBITMQ_EXCHANGE = 'ecommerce.events';

export const RABBITMQ_ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
} as const;

export const RABBITMQ_QUEUES = {
  NOTIFICATION: 'order.notification',
} as const;
