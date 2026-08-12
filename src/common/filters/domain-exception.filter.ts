import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';

import { DomainException } from '../exceptions';
import { grpcError } from './grpc-error';

@Catch(DomainException)
export class DomainExceptionFilter implements RpcExceptionFilter<DomainException> {
  catch(exception: DomainException): Observable<never> {
    return throwError(() =>
      grpcError(
        this.getGrpcStatus(exception.code),
        JSON.stringify({
          code: exception.code,
          message: exception.message,
        }),
      ),
    );
  }

  private getGrpcStatus(code: string): number {
    switch (code) {
      case 'ENTITY_NOT_FOUND':
        return GrpcStatus.NOT_FOUND;

      case 'REFERENCED_ENTITY_MISSING':
        return GrpcStatus.INVALID_ARGUMENT;

      default:
        return GrpcStatus.INTERNAL;
    }
  }
}
