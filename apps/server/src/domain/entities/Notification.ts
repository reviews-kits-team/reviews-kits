export interface NotificationProps {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  formId?: string | null;
  testimonialId?: string | null;
  isRead: boolean;
  createdAt?: Date;
}

export class Notification {
  public readonly id: string;
  private readonly userId: string;
  private readonly type: string;
  private readonly title: string;
  private readonly body?: string;
  private readonly formId?: string | null;
  private readonly testimonialId?: string | null;
  private isRead: boolean;
  public readonly createdAt: Date;

  constructor(props: NotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.body = props.body;
    this.formId = props.formId;
    this.testimonialId = props.testimonialId;
    this.isRead = props.isRead;
    this.createdAt = props.createdAt ?? new Date();
  }

  public getProps(): NotificationProps {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      body: this.body,
      formId: this.formId,
      testimonialId: this.testimonialId,
      isRead: this.isRead,
      createdAt: this.createdAt,
    };
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public getUserId(): string {
    return this.userId;
  }
}
