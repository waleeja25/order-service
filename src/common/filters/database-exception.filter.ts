import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { throwError } from 'rxjs';
import { MYSQL_ERRORS, grpcError } from '@microservices/microservice-common';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter<QueryFailedError> {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError) {
    const driverError = exception.driverError as
      | {
          errno?: number;
          code?: string;
        }
      | undefined;

    switch (driverError?.errno) {
      case MYSQL_ERRORS.DUPLICATE_ENTRY:
        this.logger.warn(exception.message);

        return throwError(() =>
          grpcError(
            GrpcStatus.ALREADY_EXISTS,
            'Duplicate value already exists',
          ),
        );

      case MYSQL_ERRORS.ROW_IS_REFERENCED:
        this.logger.warn(exception.message);

        return throwError(() =>
          grpcError(
            GrpcStatus.FAILED_PRECONDITION,
            'Record is still referenced by other records',
          ),
        );

      case MYSQL_ERRORS.NO_REFERENCED_ROW:
        this.logger.warn(exception.message);

        return throwError(() =>
          grpcError(
            GrpcStatus.INVALID_ARGUMENT,
            'Referenced record does not exist',
          ),
        );

      default:
        this.logger.error('Unhandled database error', exception.stack);

        return throwError(() =>
          grpcError(GrpcStatus.INTERNAL, 'Internal Server Error'),
        );
    }
  }
}
