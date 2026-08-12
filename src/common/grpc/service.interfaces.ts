import type { Observable } from 'rxjs';
import { EntityIdRequest } from '../interfaces';

export interface UserGrpcService {
  getById(request: EntityIdRequest): Observable<unknown>;
}

export interface CatalogGrpcService {
  getById(request: EntityIdRequest): Observable<ProductResponse>;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}
