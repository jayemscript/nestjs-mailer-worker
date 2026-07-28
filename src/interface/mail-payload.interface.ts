export interface MailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  smtpCredentials?: {
    id: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from?: string;
  };
}
