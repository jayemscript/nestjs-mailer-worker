import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async check() {
    if (this.connection.readyState !== 1) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
      });
    }

    try {
      if (!this.connection.db) {
        throw new Error('Database handle is unavailable');
      }

      await this.connection.db.command({ ping: 1 });

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unavailable',
      });
    }
  }
}
