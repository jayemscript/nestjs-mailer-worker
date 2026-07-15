//src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProviderService } from 'src/provider/provider.service';
import { ProviderType } from 'src/common/enums/provider-type.enum';
import { EmailStatus } from 'src/common/enums/email-status.enum';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailLog, EmailLogDocument } from './schemas/email-log.schema';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly providerService: ProviderService,
    @InjectModel(EmailLog.name)
    private readonly emailLogModel: Model<EmailLogDocument>,
  ) {}

  async send(dto: SendEmailDto): Promise<EmailLog> {
    const log = await this.emailLogModel.create({
      appId: dto.appId,
      to: dto.to,
      subject: dto.subject,
      from: dto.from,
      provider: ProviderType.GMAIL,
      status: EmailStatus.PENDING,
    });

    try {
      await this.providerService.send(ProviderType.GMAIL, {
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
      log.errorMessage = (error as Error).message;
      await log.save();

      this.logger.error(
        `Failed to send email to ${dto.to}`,
        (error as Error).stack,
      );
      throw error;
    }

    return log;
  }
}
