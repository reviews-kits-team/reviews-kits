export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailService {
  send(options: SendEmailOptions): Promise<void>;
}
