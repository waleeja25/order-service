import { Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { MYSQL_ERRORS } from '../constants';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { throwError } from 'rxjs';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter<QueryFailedError> {
  catch(exception: QueryFailedError) {
    const driverError = exception.driverError as {
      errno?: number;
      code?: string;
    };

    switch (driverError.errno) {
      case MYSQL_ERRORS.DUPLICATE_ENTRY:
        return throwError(
          () =>
            new RpcException({
              code: GrpcStatus.ALREADY_EXISTS,
              message: 'Duplicate value already exists',
            }),
        );

      case MYSQL_ERRORS.ROW_IS_REFERENCED:
        return throwError(
          () =>
            new RpcException({
              code: GrpcStatus.FAILED_PRECONDITION,
              message: 'Record is still referenced by other records',
            }),
        );

      case MYSQL_ERRORS.NO_REFERENCED_ROW:
        return throwError(
          () =>
            new RpcException({
              code: GrpcStatus.INVALID_ARGUMENT,
              message: 'Referenced record does not exist',
            }),
        );
      default:
        return throwError(
          () =>
            new RpcException({
              code: GrpcStatus.INTERNAL,
              message: 'Internal Server Error',
            }),
        );
    }
  }
}
