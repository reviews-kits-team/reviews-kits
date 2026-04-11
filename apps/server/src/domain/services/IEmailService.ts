export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface NewReviewNotificationData {
  ownerEmail: string;
  formName: string;
  formId: string;
  authorName: string;
  rating?: number;
  content: string;
  adminUrl: string;
}

export interface IEmailService {
  send(options: SendEmailOptions): Promise<void>;
  sendNewReviewNotification(data: NewReviewNotificationData): Promise<void>;
}
