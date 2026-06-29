export interface MailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}