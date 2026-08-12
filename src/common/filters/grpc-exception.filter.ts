import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';

import { grpcError, GrpcErrorPayload } from './grpc-error';

@Catch()
export class GrpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: unknown): Observable<never> {
    if (exception instanceof RpcException) {
      return throwError(() => this.fromRpcException(exception));
    }

    return throwError(() =>
      grpcError(GrpcStatus.INTERNAL, 'Internal server error'),
    );
  }

  private fromRpcException(exception: RpcException): GrpcErrorPayload {
    const error: unknown = exception.getError();

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'number'
    ) {
      const { code, message } = error as { code: number; message?: string };

      return grpcError(code, message ?? exception.message);
    }

    return grpcError(
      GrpcStatus.INTERNAL,
      typeof error === 'string' ? error : exception.message,
    );
  }
}
