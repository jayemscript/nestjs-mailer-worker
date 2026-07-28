import { MailPayload } from '../../interface/mail-payload.interface';

export interface MailSendResult {
  providerMessageId?: string;
  acceptedRecipients?: string[];
  rejectedRecipients?: string[];
  providerResponse?: string;
}

export interface IMailAdapter {
  send(payload: MailPayload): Promise<MailSendResult>;
}
