import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import type { IEmailService, SendEmailOptions, NewReviewNotificationData } from '../../domain/services/IEmailService';
import { NewReviewEmail } from './templates/newReview';

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private readonly smtpUser: string;

  constructor(private readonly baseUrl: string, transporter?: nodemailer.Transporter) {
    if (transporter) {
      this.transporter = transporter;
      this.smtpUser = '';
      return;
    }

    const host = process.env.SMTP_HOST;
    if (!host) throw new Error('SMTP_HOST is required to instantiate NodemailerEmailService');

    const user = process.env.SMTP_USER ?? '';
    const port = Number(process.env.SMTP_PORT) || 587;

    this.smtpUser = user;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Reviewskits" <${this.smtpUser}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (err) {
      throw new Error(`Failed to send email to ${options.to}: ${(err as Error).message}`);
    }
  }

  async sendNewReviewNotification(data: NewReviewNotificationData): Promise<void> {
    const templateProps = {
      formName: data.formName,
      formId: data.formId,
      authorName: data.authorName,
      adminUrl: this.baseUrl,
    };
    const [html, text] = await Promise.all([
      render(NewReviewEmail(templateProps)),
      render(NewReviewEmail(templateProps), { plainText: true }),
    ]);
    try {
      await this.transporter.sendMail({
        from: `"Reviewskits" <${this.smtpUser}>`,
        to: data.ownerEmail,
        subject: `New review on "${data.formName}"`,
        html,
        text,
      });
    } catch (err) {
      throw new Error(`Failed to send review notification to ${data.ownerEmail}: ${(err as Error).message}`);
    }
  }
}
