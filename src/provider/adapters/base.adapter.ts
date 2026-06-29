import { MailPayload } from 'src/interface/mail-payload.interface';

export interface IMailAdapter {
  send(payload: MailPayload): Promise<void>;
}
