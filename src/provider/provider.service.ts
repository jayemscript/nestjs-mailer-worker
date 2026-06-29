import { Injectable } from '@nestjs/common';
import { ProviderRegistry } from './provider.registry';
import { ProviderType } from '../common/enums/provider-type.enum';
import { MailPayload } from 'src/interface/mail-payload.interface';

@Injectable()
export class ProviderService {
  constructor(private readonly registry: ProviderRegistry) {}

  async send(type: ProviderType, payload: MailPayload): Promise<void> {
    const adapter = this.registry.resolve(type);
    await adapter.send(payload);
  }
}
