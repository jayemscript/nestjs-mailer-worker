import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailAdapter } from './base.adapter';
import { MailPayload } from 'src/interface/mail-payload.interface';

@Injectable()
export class GmailAdapter implements IMailAdapter {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get<string>('GMAIL_USER'),
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        refreshToken: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
      },
    });
  }

  async send(payload: MailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: payload.from ?? this.configService.get<string>('GMAIL_USER'),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }
}
