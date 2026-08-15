import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { DomainException } from '../exceptions';
import { grpcError } from './grpc-error';

@Catch(DomainException)
export class DomainExceptionFilter
  implements RpcExceptionFilter<DomainException>
{
  catch(exception: DomainException): Observable<never> {
    return throwError(() =>
      grpcError(
        exception.grpcStatus,
        JSON.stringify({
          code: exception.code,
          message: exception.message,
        }),
      ),
    );
  }
}
