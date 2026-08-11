/* eslint-disable */
import { GrpcMethod } from '@nestjs/microservices';

export const ExtendGrpcDecorator =
  (name: string) =>
  (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) =>
    GrpcMethod(name, propertyKey)(target, propertyKey, descriptor);

export const GrpcController =
  (name: string): ClassDecorator =>
  (target: any) => {
    let currentTarget = target;

    while (currentTarget.prototype) {
      const methodNames = Object.getOwnPropertyNames(
        currentTarget.prototype,
      ).filter(
        (item) =>
          typeof currentTarget.prototype[item] === 'function',
      );

      methodNames
        .filter((methodName) => methodName !== 'constructor')
        .forEach((methodName) => {
          const descriptor = Object.getOwnPropertyDescriptor(
            currentTarget.prototype,
            methodName,
          );

          if (!descriptor) {
            return;
          }

          ExtendGrpcDecorator(name)(
            currentTarget.prototype,
            methodName,
            descriptor,
          );
        });

      currentTarget = Object.getPrototypeOf(currentTarget);
    }
  };