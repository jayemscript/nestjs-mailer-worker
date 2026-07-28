import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsModule } from '../applications/applications.module';
import { CredentialEncryptionService } from './credential-encryption.service';
import { MailAccountsController } from './mail-accounts.controller';
import { MailAccountsService } from './mail-accounts.service';
import { MailAccount, MailAccountSchema } from './schemas/mail-account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MailAccount.name, schema: MailAccountSchema }]),
    ApplicationsModule,
  ],
  controllers: [MailAccountsController],
  providers: [MailAccountsService, CredentialEncryptionService],
  exports: [MailAccountsService],
})
export class MailAccountsModule {}
