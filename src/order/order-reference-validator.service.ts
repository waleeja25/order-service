import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CatalogProto, UserProto } from 'microservices-proto';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

import {
  GRPC_CLIENTS,
  GRPC_SERVICES,
  ReferencedEntityMissingException,
} from '../common';

@Injectable()
export class OrderReferenceValidatorService {
  private readonly userService: UserProto.UserServiceClient;
  private readonly productService: CatalogProto.ProductServiceClient;

  constructor(
    @Inject(GRPC_CLIENTS.USER)
    userClient: ClientGrpc,

    @Inject(GRPC_CLIENTS.CATALOG)
    catalogClient: ClientGrpc,
  ) {
    this.userService = userClient.getService<UserProto.UserServiceClient>(
      GRPC_SERVICES.USER,
    );

    this.productService =
      catalogClient.getService<CatalogProto.ProductServiceClient>(
        GRPC_SERVICES.PRODUCT,
      );
  }

  async validateUser(userId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.userService.getById({
          id: userId,
        }),
      );
    } catch (error) {
      if (this.isGrpcNotFound(error)) {
        throw new ReferencedEntityMissingException('User', userId);
      }

      throw error;
    }
  }

  async fetchProduct(productId: number): Promise<CatalogProto.Product> {
    try {
      return await firstValueFrom(
        this.productService.getById({ id: productId }),
      );
    } catch (error) {
      if (this.isGrpcNotFound(error)) {
        throw new ReferencedEntityMissingException('Product', productId);
      }
      throw error;
    }
  }

  private isGrpcNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === GrpcStatus.NOT_FOUND
    );
  }
}
