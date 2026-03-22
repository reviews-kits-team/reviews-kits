import { Slug } from "../value-objects/Slug";
import { deepMerge } from "../../shared/utils/deepMerge";

export interface FormProps {
  id: string;
  userId: string;
  name: string;
  slug: Slug;
  publicId: string;
  description?: string;
  thankYouMessage?: string;
  config?: Record<string, any>;
  accentColor?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Form {
  public readonly id: string;
  public readonly userId: string;
  private name: string;
  private slug: Slug;
  public readonly publicId: string;
  private description?: string;
  private thankYouMessage?: string;
  private config: Record<string, any>;
  private accentColor?: string;
  private isActive: boolean;
  public readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: FormProps) {
    if (!props.name) throw new Error("Form name cannot be empty");

    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.slug = props.slug;
    this.publicId = props.publicId;
    this.description = props.description;
    this.thankYouMessage = props.thankYouMessage;
    this.config = props.config ?? {};
    this.accentColor = props.accentColor;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public getProps(): FormProps {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      slug: this.slug,
      publicId: this.publicId,
      description: this.description,
      thankYouMessage: this.thankYouMessage,
      config: { ...this.config },
      accentColor: this.accentColor,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public updateName(name: string): void {
    if (!name) throw new Error("Form name cannot be empty");
    this.name = name;
    this.updatedAt = new Date();
  }

  public toggleActive(): void {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
  }

  public updateConfig(config: Record<string, any>): void {
    this.config = deepMerge(this.config, config);
    this.updatedAt = new Date();
  }

  public getName(): string {
    return this.name;
  }

  public getSlug(): string {
    return this.slug.getValue();
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public equals(other: Form): boolean {
    if (!(other instanceof Form)) return false;
    return this.id === other.id;
  }
}
