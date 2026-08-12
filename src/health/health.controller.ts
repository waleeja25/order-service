import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { platform } from 'os';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const diskPath = platform() === 'win32' ? 'C:\\' : '/';

    return this.health.check([
      () => this.db.pingCheck('database'),

      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),

      () =>
        this.disk.checkStorage('disk', {
          path: diskPath,
          thresholdPercent: 0.9,
        }),
    ]);
  }
}
