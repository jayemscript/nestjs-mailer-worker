import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { SmtpCredentialsDto } from './dto/smtp-credentials.dto';

@Injectable()
export class CredentialEncryptionService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(credentials: SmtpCredentialsDto): string {
    const key = this.getKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(credentials), 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decrypt(value: string): SmtpCredentialsDto {
    const [version, iv, authTag, encrypted, ...extra] = value.split(':');
    if (version !== 'v1' || !iv || !authTag || !encrypted || extra.length) {
      throw new Error('Stored mail credentials have an invalid encryption format');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getKey(),
      Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ]).toString('utf8');

    return JSON.parse(decrypted) as SmtpCredentialsDto;
  }

  private getKey(): Buffer {
    const configuredKey = this.configService.get<string>(
      'mail.credentialsEncryptionKey',
    );
    if (!configuredKey) {
      throw new Error('MAIL_CREDENTIALS_ENCRYPTION_KEY is required for database mail accounts');
    }

    const key = /^[a-f0-9]{64}$/i.test(configuredKey)
      ? Buffer.from(configuredKey, 'hex')
      : Buffer.from(configuredKey, 'base64');
    if (key.length !== 32) {
      throw new Error('MAIL_CREDENTIALS_ENCRYPTION_KEY must be a 32-byte base64 value or 64-character hex value');
    }
    return key;
  }
}
