import { Injectable } from '@nestjs/common';
import { ProviderRegistry } from './provider.registry';
import { ProviderType } from '../common/enums/provider-type.enum';
import { MailPayload } from '../interface/mail-payload.interface';
import { MailSendResult } from './adapters/base.adapter';

@Injectable()
export class ProviderService {
  constructor(private readonly registry: ProviderRegistry) {}

  async send(type: ProviderType, payload: MailPayload): Promise<MailSendResult> {
    const adapter = this.registry.resolve(type);
    return adapter.send(payload);
  }
}
