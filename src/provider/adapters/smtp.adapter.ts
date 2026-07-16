import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { MailPayload } from '../../interface/mail-payload.interface';
import { IMailAdapter } from './base.adapter';

@Injectable()
export class SmtpAdapter implements IMailAdapter {
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async send(payload: MailPayload): Promise<void> {
    const user = this.getRequiredConfig('mail.smtp.user');
    const from =
      payload.from ?? this.configService.get<string>('mail.smtp.from') ?? user;

    await this.getTransporter().sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.getRequiredConfig('mail.smtp.host'),
        port: this.configService.get<number>('mail.smtp.port', 465),
        secure: this.configService.get<boolean>('mail.smtp.secure', true),
        auth: {
          user: this.getRequiredConfig('mail.smtp.user'),
          pass: this.getRequiredConfig('mail.smtp.pass'),
        },
      });
    }

    return this.transporter;
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required SMTP configuration: ${key}`);
    }

    return value;
  }
}
