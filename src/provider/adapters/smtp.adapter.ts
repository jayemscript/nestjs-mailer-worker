import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { MailPayload } from '../../interface/mail-payload.interface';
import { IMailAdapter, MailSendResult } from './base.adapter';

@Injectable()
export class SmtpAdapter implements IMailAdapter {
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async send(payload: MailPayload): Promise<MailSendResult> {
    const account = payload.smtpCredentials ?? this.getDefaultAccount();
    const from = payload.from ?? account.from ?? account.user;

    const result = await this.getTransporter(account).sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return {
      providerMessageId: result.messageId,
      acceptedRecipients: result.accepted,
      rejectedRecipients: result.rejected,
      providerResponse: result.response,
    };
  }

  private getTransporter(account: SmtpAccount): Transporter {
    if (!account.id && !this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: account.host,
        port: account.port,
        secure: account.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
    }

    if (!account.id) {
      return this.transporter!;
    }

    // Database credentials can change without a service restart, so do not
    // retain a transporter that may contain an old password.
    return nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: account.secure,
      auth: { user: account.user, pass: account.pass },
    });
  }

  private getDefaultAccount(): SmtpAccount {
    return {
      host: this.getRequiredConfig('mail.smtp.host'),
      port: this.configService.get<number>('mail.smtp.port', 465),
      secure: this.configService.get<boolean>('mail.smtp.secure', true),
      user: this.getRequiredConfig('mail.smtp.user'),
      pass: this.getRequiredConfig('mail.smtp.pass'),
      from: this.configService.get<string>('mail.smtp.from'),
    };
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required SMTP configuration: ${key}`);
    }

    return value;
  }
}

interface SmtpAccount {
  id?: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from?: string;
}
