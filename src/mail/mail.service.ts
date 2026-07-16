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

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
    @InjectModel(EmailLog.name)
    private readonly emailLogModel: Model<EmailLogDocument>,
  ) {}

  async send(dto: SendEmailDto): Promise<EmailLog> {
    const provider = this.getProvider(dto.provider);
    const log = await this.emailLogModel.create({
      appId: dto.appId,
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
      from: dto.from,
      provider,
      status: EmailStatus.PENDING,
    });

    try {
      await this.providerService.send(provider, {
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
        from: dto.from,
      });

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

  private getProvider(requestedProvider?: ProviderType): ProviderType {
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
}
