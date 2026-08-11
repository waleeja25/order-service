import * as dotenv from 'dotenv';
import { ObjectSchema, ValidationResult } from 'joi';

export function validateEnv<T>(schema: ObjectSchema): T {
  dotenv.config();

  const result = schema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
    convert: true,
  }) as ValidationResult<T>;

  if (result.error) {
    throw new Error(`Environment validation failed:\n${result.error.message}`);
  }

  return result.value;
}
