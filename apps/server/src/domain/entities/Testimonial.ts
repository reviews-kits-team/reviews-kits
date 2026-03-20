import type { TestimonialStatus, TestimonialSource } from '@reviewskits/types';
import { Rating } from '../value-objects/Rating';
import { Email } from '../value-objects/Email';

export interface TestimonialProps {
  id: string;
  projectId: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export class Testimonial {
  public readonly id: string;
  public readonly projectId: string;
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
  public readonly createdAt: Date;
  private updatedAt: Date;
  private metadata: Record<string, any>;

  constructor(props: TestimonialProps) {
    if (!props.content) throw new Error("Testimonial content cannot be empty");
    if (!props.authorName) throw new Error("Testimonial author name cannot be empty");
    if (!props.projectId) throw new Error("Testimonial project ID cannot be empty");

    const source = props.source ?? 'form';
    if (source === 'form' && !props.formId) {
      throw new Error("Testimonial from form source must have a form ID");
    }

    this.id = props.id;
    this.projectId = props.projectId;
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
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.metadata = props.metadata ?? {};
  }

  public getProps(): TestimonialProps {
    return {
      id: this.id,
      projectId: this.projectId,
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
    };
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
