export class Slug {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error(`Invalid slug: ${value}`);
    }
  }

  public static create(value: string): Slug {
    const normalized = value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-") // Replace any sequence of non-alphanumeric with a single hyphen
      .replace(/^-+|-+$/g, "");    // Remove hyphens from start/end
    
    return new Slug(normalized);
  }

  public getValue(): string {
    return this.value;
  }

  private isValid(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  public equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
