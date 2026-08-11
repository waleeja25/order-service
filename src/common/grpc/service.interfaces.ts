import type { Observable } from 'rxjs';
import { EntityIdRequest } from '../interfaces';

export interface UserGrpcService {
  getById(request: EntityIdRequest): Observable<unknown>;
}

export interface CatalogGrpcService {
  getById(request: EntityIdRequest): Observable<unknown>;
}
