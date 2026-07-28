//src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProviderService } from '../provider/provider.service';
import { ProviderType } from '../common/enums/provider-type.enum';
import { EmailStatus } from '../common/enums/email-status.enum';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailLog, EmailLogDocument } from './schemas/email-log.schema';
import { EmailOrigin } from '../common/enums/email-origin.enum';
import { MailAccountsService, ResolvedMailAccount } from '../mail-accounts/mail-accounts.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
    private readonly mailAccountsService: MailAccountsService,
    @InjectModel(EmailLog.name)
    private readonly emailLogModel: Model<EmailLogDocument>,
  ) {}

  async send(dto: SendEmailDto): Promise<EmailLog> {
    const mailAccount = dto.mailAccountId
      ? await this.mailAccountsService.resolveForApplication(dto.mailAccountId, dto.appId)
      : undefined;
    const provider = this.getProvider(dto.provider, mailAccount);
    const log = await this.emailLogModel.create({
      appId: dto.appId,
      origin: dto.origin,
      userId: dto.origin === EmailOrigin.USER ? dto.userId : null,
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
      from: dto.from,
      provider,
      mailAccountId: mailAccount?.id,
      status: EmailStatus.PENDING,
    });

    try {
      const delivery = await this.providerService.send(provider, {
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
        from: dto.from,
        smtpCredentials: mailAccount
          ? { id: mailAccount.id, ...mailAccount.credentials }
          : undefined,
      });

      log.providerMessageId = delivery.providerMessageId;
      log.acceptedRecipients = delivery.acceptedRecipients;
      log.rejectedRecipients = delivery.rejectedRecipients;
      log.providerResponse = delivery.providerResponse;

      if (delivery.rejectedRecipients?.length) {
        throw new Error(
          `Provider rejected recipient(s): ${delivery.rejectedRecipients.join(', ')}`,
        );
      }

      log.status = EmailStatus.SENT;
      await log.save();

      this.logger.log(`Email sent to ${dto.to}`);
    } catch (error) {
      log.status = EmailStatus.FAILED;
      log.errorMessage =
        error instanceof Error ? error.message : 'Unknown email error';

      await log.save();

      this.logger.error(
        `Failed to send email to ${dto.to}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }

    return log;
  }

  async sendBulk(dtos: SendEmailDto[]): Promise<EmailLog[]> {
    const logs: EmailLog[] = [];
    const delayMs = this.configService.get<number>('mail.bulk.delayMs', 750);

    for (let index = 0; index < dtos.length; index += 1) {
      logs.push(await this.send(dtos[index]));

      if (index < dtos.length - 1 && delayMs > 0) {
        await this.wait(delayMs);
      }
    }

    return logs;
  }

  async findAll(): Promise<EmailLog[]> {
    return this.emailLogModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByAppId(appId: string): Promise<EmailLog[]> {
    return this.emailLogModel.find({ appId }).sort({ createdAt: -1 }).exec();
  }

  async findByAppIdAndUserId(appId: string, userId: string): Promise<EmailLog[]> {
    return this.emailLogModel
      .find({ appId, userId, origin: EmailOrigin.USER })
      .sort({ createdAt: -1 })
      .exec();
  }

  private getProvider(
    requestedProvider?: ProviderType,
    mailAccount?: ResolvedMailAccount,
  ): ProviderType {
    if (mailAccount && requestedProvider && requestedProvider !== mailAccount.provider) {
      throw new Error(
        `Requested provider ${requestedProvider} does not match mail account provider ${mailAccount.provider}`,
      );
    }
    if (mailAccount) {
      return mailAccount.provider;
    }
    if (requestedProvider) {
      return requestedProvider;
    }

    const configuredProvider = this.configService.get<string>(
      'mail.provider',
      ProviderType.GMAIL,
    );

    if (
      !Object.values(ProviderType).includes(configuredProvider as ProviderType)
    ) {
      throw new Error(`Unsupported mail provider: ${configuredProvider}`);
    }

    return configuredProvider as ProviderType;
  }

  private wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
