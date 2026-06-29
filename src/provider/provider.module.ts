import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProviderService } from './provider.service';
import { ProviderRegistry } from './provider.registry';
import { GmailAdapter } from './adapters/gmail.adapter';
import { ProviderType } from '../common/enums/provider-type.enum';

@Module({
  imports: [ConfigModule],
  providers: [ProviderService, ProviderRegistry, GmailAdapter],
  exports: [ProviderService],
})
export class ProviderModule implements OnModuleInit {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly gmailAdapter: GmailAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(ProviderType.GMAIL, this.gmailAdapter);
  }
}
