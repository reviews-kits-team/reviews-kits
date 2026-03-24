import type { TestimonialStatus, TestimonialSource } from '@reviewskits/types';
import { Rating } from '../value-objects/Rating';
import { Email } from '../value-objects/Email';

export interface TestimonialProps {
  id: string;
  userId: string;
  content: string;
  authorName: string;
  status?: TestimonialStatus;
  source?: TestimonialSource;
  rating?: Rating;
  authorEmail?: Email;
  authorTitle?: string;
  authorUrl?: string;
  formId?: string;
  mediaId?: string;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export class Testimonial {
  private readonly id: string;
  private readonly userId: string;
  private content: string;
  private authorName: string;
  private status: TestimonialStatus;
  private source: TestimonialSource;
  private rating?: Rating;
  private authorEmail?: Email;
  private authorTitle?: string;
  private authorUrl?: string;
  private formId?: string;
  private mediaId?: string;
  private position: number;
  public readonly createdAt: Date;
  private updatedAt: Date;
  private metadata: Record<string, any>;

  constructor(props: TestimonialProps) {
    if (!props.content) throw new Error("Testimonial content cannot be empty");
    if (!props.authorName) throw new Error("Testimonial author name cannot be empty");
    if (!props.userId) throw new Error("Testimonial user ID cannot be empty");

    const source = props.source ?? 'form';
    if (source === 'form' && !props.formId) {
      throw new Error("Testimonial from form source must have a form ID");
    }

    this.id = props.id;
    this.userId = props.userId;
    this.content = props.content;
    this.authorName = props.authorName;
    this.status = props.status ?? 'pending';
    this.source = props.source ?? 'form';
    this.rating = props.rating;
    this.authorEmail = props.authorEmail;
    this.authorTitle = props.authorTitle;
    this.authorUrl = props.authorUrl;
    this.formId = props.formId;
    this.mediaId = props.mediaId;
    this.position = props.position ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.metadata = props.metadata ?? {};
  }

  public getProps(): TestimonialProps {
    return {
      id: this.id,
      userId: this.userId,
      content: this.content,
      authorName: this.authorName,
      status: this.status,
      source: this.source,
      rating: this.rating,
      authorEmail: this.authorEmail,
      authorTitle: this.authorTitle,
      authorUrl: this.authorUrl,
      formId: this.formId,
      mediaId: this.mediaId,
      position: this.position,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
    };
  }

  public updatePosition(position: number): void {
    this.position = position;
    this.updatedAt = new Date();
  }

  public approve(): void {
    this.status = 'approved';
    this.updatedAt = new Date();
  }

  public reject(): void {
    this.status = 'rejected';
    this.updatedAt = new Date();
  }

  public updateContent(content: string): void {
    if (!content) throw new Error("Testimonial content cannot be empty");
    this.content = content;
    this.updatedAt = new Date();
  }

  public getStatus(): TestimonialStatus {
    return this.status;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getId(): string {
    return this.id;
  }

  public getRatingValue(): number | undefined {
    return this.rating?.getValue();
  }

  public getAuthorEmailValue(): string | undefined {
    return this.authorEmail?.getValue();
  }

  public equals(other: Testimonial): boolean {
    if (!(other instanceof Testimonial)) return false;
    return this.id === other.id;
  }
}
