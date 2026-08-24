# Order Service

gRPC service for managing orders. Backed by MySQL via TypeORM, with soft delete.

## gRPC methods (`OrderService`)

`create`, `getById`, `delete`, `list` (filterable by `userId`/`productId`, paginated). There's no `update` — an order's contents aren't editable after creation.

## Create/delete flow

1. Calls `user-service` and `catalog-service` over gRPC, concurrently, to confirm the referenced user and product exist.
   - `NOT_FOUND` → `ReferencedEntityMissingException` (→ `400` at the gateway).
   - `UNAVAILABLE`/`DEADLINE_EXCEEDED` → `ServiceUnavailableException` (→ `503`), so a downstream outage doesn't look like a bug in this service.
2. Saves the order.
3. Publishes `order.created`/`order.deleted` to **both** RabbitMQ (consumed by `notification-service`) and Kafka (consumed by `analytics-service`), in parallel.

## Error handling

Business rule violations and not-found lookups throw a typed `DomainException`, mapped to a gRPC status by `GrpcExceptionFilter`/`DomainExceptionFilter`. MySQL constraint violations are mapped by `DatabaseExceptionFilter`.

## Stack

NestJS, `@grpc/grpc-js`, TypeORM, MySQL, RabbitMQ, Kafka

## Folder structure

```
src/
├── order/                 # controller, service, mapper, entity, validators, reference validator
├── rabbitmq/               # producer: RabbitMQService, order.created/deleted events
├── kafka/                  # producer: KafkaService, order.created/deleted events
├── common/                  # BaseEntity/BaseService, exceptions, filters, gRPC constants
├── config/
├── database/                # data source + migrations
└── health/
```

## Running locally

```bash
npm install
npm run migration:run
npm run start:dev
```

HTTP health check on `PORT` (default `3003`), gRPC server on `GRPC_URL` (default `0.0.0.0:50053`).

## Required env vars

```
PORT=3003
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=order_db
GRPC_URL=0.0.0.0:50053

USER_SERVICE_GRPC_URL=127.0.0.1:50051
CATALOG_SERVICE_GRPC_URL=127.0.0.1:50052

RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_NOTIFICATION_QUEUE=notification_queue

KAFKA_BROKER=localhost:9092
```

## Depends on

A running MySQL instance with an `order_db` database, `user-service` and `catalog-service` reachable via gRPC, and a running RabbitMQ broker and Kafka broker.
