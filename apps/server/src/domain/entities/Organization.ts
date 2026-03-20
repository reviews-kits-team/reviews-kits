import { Slug } from "../value-objects/Slug";

export interface OrganizationProps {
  id: string;
  name: string;
  slug: Slug;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization {
  public readonly id: string;
  private name: string;
  private slug: Slug;
  public readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: OrganizationProps) {
    if (!props.name) throw new Error("Organization name cannot be empty");

    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public getProps(): OrganizationProps {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public updateName(name: string): void {
    if (!name) throw new Error("Organization name cannot be empty");
    this.name = name;
    this.updatedAt = new Date();
  }

  public getSlug(): string {
    return this.slug.getValue();
  }

  public getName(): string {
    return this.name;
  }

  public equals(other: Organization): boolean {
    if (!(other instanceof Organization)) return false;
    return this.id === other.id;
  }
}
