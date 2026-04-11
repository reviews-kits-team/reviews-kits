import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import type { IEmailService, SendEmailOptions, NewReviewNotificationData } from '../../domain/services/IEmailService';
import { NewReviewEmail } from './templates/newReview';

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly baseUrl: string) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: `"Reviewskits" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async sendNewReviewNotification(data: NewReviewNotificationData): Promise<void> {
    const html = await render(NewReviewEmail({
      formName: data.formName,
      formId: data.formId,
      authorName: data.authorName,
      rating: data.rating,
      content: data.content,
      adminUrl: this.baseUrl,
    }));
    await this.send({
      to: data.ownerEmail,
      subject: `New review on "${data.formName}"`,
      html,
    });
  }
}
