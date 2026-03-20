import { Slug } from "../value-objects/Slug";
import { deepMerge } from "../../shared/utils/deepMerge";

export interface ProjectProps {
  id: string;
  organizationId: string;
  name: string;
  slug: Slug;
  settings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project {
  public readonly id: string;
  public readonly organizationId: string;
  private name: string;
  private slug: Slug;
  private settings: Record<string, any>;
  public readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: ProjectProps) {
    if (!props.name) throw new Error("Project name cannot be empty");

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.slug = props.slug;
    this.settings = props.settings ?? {};
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public getProps(): ProjectProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      slug: this.slug,
      settings: { ...this.settings },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public updateName(name: string): void {
    if (!name) throw new Error("Project name cannot be empty");
    this.name = name;
    this.updatedAt = new Date();
  }

  public updateSettings(settings: Record<string, any>): void {
    this.settings = deepMerge(this.settings, settings);
    this.updatedAt = new Date();
  }

  public getName(): string {
    return this.name;
  }

  public getSlug(): string {
    return this.slug.getValue();
  }

  public getSettings(): Record<string, any> {
    return { ...this.settings };
  }

  public equals(other: Project): boolean {
    if (!(other instanceof Project)) return false;
    return this.id === other.id;
  }
}
