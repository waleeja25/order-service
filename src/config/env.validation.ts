import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),

  GRPC_URL: Joi.string().required(),

  RABBITMQ_URL: Joi.string().uri().required(),
  RABBITMQ_NOTIFICATION_QUEUE: Joi.string().required(),
});
