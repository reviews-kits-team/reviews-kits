export interface WebhookProps {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Webhook {
  private props: WebhookProps;

  constructor(props: WebhookProps) {
    this.props = {
      ...props,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public getProps(): WebhookProps {
    return { ...this.props };
  }

  public getId(): string {
    return this.props.id;
  }

  public getUserId(): string {
    return this.props.userId;
  }

  public getUrl(): string {
    return this.props.url;
  }

  public getEvents(): string[] {
    return this.props.events;
  }

  public getSecret(): string {
    return this.props.secret;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public update(props: Partial<Omit<WebhookProps, 'id' | 'userId' | 'createdAt'>>): void {
    this.props = {
      ...this.props,
      ...props,
      updatedAt: new Date(),
    };
  }

  public hasEvent(event: string): boolean {
    return this.props.events.includes(event) || this.props.events.includes('*');
  }
}
