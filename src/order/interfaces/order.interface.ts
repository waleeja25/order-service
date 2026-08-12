export interface CreateOrderRequest {
  userId: number;
  productId: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrderRequest {
  page: number;
  limit: number;
  userId?: number;
  productId?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListResponse {
  data: OrderResponse[];
  meta: PaginationMeta;
}
