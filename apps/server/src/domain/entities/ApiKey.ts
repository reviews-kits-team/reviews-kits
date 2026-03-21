export interface ApiKeyProps {
  id: string;
  userId: string;
  key: string;
  type: 'public' | 'secret';
  name?: string;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
}

export class ApiKey {
  public readonly id: string;
  public readonly userId: string;
  public readonly key: string;
  public readonly type: 'public' | 'secret';
  private name?: string;
  private lastUsed?: Date;
  private expiresAt?: Date;
  private isActive: boolean;
  public readonly createdAt: Date;

  constructor(props: ApiKeyProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.key = props.key;
    this.type = props.type;
    this.name = props.name;
    this.lastUsed = props.lastUsed;
    this.expiresAt = props.expiresAt;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  public getProps(): ApiKeyProps {
    return {
      id: this.id,
      userId: this.userId,
      key: this.key,
      type: this.type,
      name: this.name,
      lastUsed: this.lastUsed,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  public updateLastUsed(): void {
    this.lastUsed = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }
}
