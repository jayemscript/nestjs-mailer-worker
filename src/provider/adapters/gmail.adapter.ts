import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { IMailAdapter } from './base.adapter';
import { MailPayload } from 'src/interface/mail-payload.interface';

@Injectable()
export class GmailAdapter implements IMailAdapter {
  private gmail;

  constructor(private readonly configService: ConfigService) {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
    });

    this.gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });
  }

  async send(payload: MailPayload): Promise<void> {
    const from = payload.from ?? this.configService.get<string>('GMAIL_USER');

    const email = [
      `From: ${from}`,
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      payload.html ?? payload.text ?? '',
    ].join('\n');

    const encodedMessage = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
  }
}
