//src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { EmailLog, EmailLogSchema } from './schemas/email-log.schema';
import { ProviderModule } from '../provider/provider.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
    ProviderModule,
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
