export interface NotificationPrefs {
  newReview: boolean;
  weeklyReport: boolean;
}

export interface UserProps {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isSystemAdmin: boolean;
  avatarUrl?: string | null;
  notificationPrefs?: NotificationPrefs;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  private email: string;
  private name: string;
  private emailVerified: boolean;
  private isSystemAdmin: boolean;
  private avatarUrl?: string | null;
  private notificationPrefs: NotificationPrefs;
  public readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.email) throw new Error("User email cannot be empty");
    if (!props.name) throw new Error("User name cannot be empty");

    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.emailVerified = props.emailVerified;
    this.isSystemAdmin = props.isSystemAdmin;
    this.avatarUrl = props.avatarUrl;
    this.notificationPrefs = props.notificationPrefs ?? { newReview: true, weeklyReport: true };
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public getProps(): UserProps {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      emailVerified: this.emailVerified,
      isSystemAdmin: this.isSystemAdmin,
      avatarUrl: this.avatarUrl,
      notificationPrefs: this.notificationPrefs,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public updateName(name: string): void {
    if (!name) throw new Error("User name cannot be empty");
    this.name = name;
    this.updatedAt = new Date();
  }

  public updateAvatar(url: string | null): void {
    this.avatarUrl = url;
    this.updatedAt = new Date();
  }

  public updateEmail(email: string): void {
    if (!email) throw new Error("User email cannot be empty");
    this.email = email;
    this.updatedAt = new Date();
  }

  public getEmail(): string {
    return this.email;
  }

  public getName(): string {
    return this.name;
  }

  public getAvatarUrl(): string | null | undefined {
    return this.avatarUrl;
  }

  public getIsSystemAdmin(): boolean {
    return this.isSystemAdmin;
  }

  public getEmailVerified(): boolean {
    return this.emailVerified;
  }

  public getNotificationPrefs(): NotificationPrefs {
    return { ...this.notificationPrefs };
  }

  public updateNotificationPrefs(prefs: Partial<NotificationPrefs>): void {
    this.notificationPrefs = { ...this.notificationPrefs, ...prefs };
    this.updatedAt = new Date();
  }

  public equals(other: User): boolean {
    if (!(other instanceof User)) return false;
    return this.id === other.id;
  }
}
