import { Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { throwError } from 'rxjs';
import { MYSQL_ERRORS, grpcError } from '@microservices/microservice-common';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter<QueryFailedError> {
  catch(exception: QueryFailedError) {
    const driverError = exception.driverError as
      | {
          errno?: number;
          code?: string;
        }
      | undefined;

    switch (driverError?.errno) {
      case MYSQL_ERRORS.DUPLICATE_ENTRY:
        return throwError(() =>
          grpcError(
            GrpcStatus.ALREADY_EXISTS,
            'Duplicate value already exists',
          ),
        );

      case MYSQL_ERRORS.ROW_IS_REFERENCED:
        return throwError(() =>
          grpcError(
            GrpcStatus.FAILED_PRECONDITION,
            'Record is still referenced by other records',
          ),
        );

      case MYSQL_ERRORS.NO_REFERENCED_ROW:
        return throwError(() =>
          grpcError(
            GrpcStatus.INVALID_ARGUMENT,
            'Referenced record does not exist',
          ),
        );

      default:
        return throwError(() =>
          grpcError(GrpcStatus.INTERNAL, 'Internal Server Error'),
        );
    }
  }
}
