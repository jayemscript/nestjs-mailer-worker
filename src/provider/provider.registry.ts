import { BadRequestException, Injectable } from '@nestjs/common';
import { IMailAdapter } from './adapters/base.adapter';
import { ProviderType } from '../common/enums/provider-type.enum';

@Injectable()
export class ProviderRegistry {
  private readonly registry = new Map<ProviderType, IMailAdapter>();

  register(type: ProviderType, adapter: IMailAdapter): void {
    this.registry.set(type, adapter);
  }

  resolve(type: ProviderType): IMailAdapter {
    const adapter = this.registry.get(type);
    if (!adapter) {
      throw new BadRequestException(
        `Mail provider is not available: ${type}. Registered providers: ${[
          ...this.registry.keys(),
        ].join(', ')}`,
      );
    }
    return adapter;
  }
}
