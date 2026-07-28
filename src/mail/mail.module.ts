//src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { EmailLog, EmailLogSchema } from './schemas/email-log.schema';
import { ProviderModule } from '../provider/provider.module';
import { ApplicationsModule } from '../applications/applications.module';
import { ApplicationIdGuard } from '../common/guards/application-id.guard';
import { MailAccountsModule } from '../mail-accounts/mail-accounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
    ProviderModule,
    ApplicationsModule,
    MailAccountsModule,
  ],
  controllers: [MailController],
  providers: [MailService, ApplicationIdGuard],
})
export class MailModule {}
