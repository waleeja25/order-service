export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
  createdAt: string;
}
