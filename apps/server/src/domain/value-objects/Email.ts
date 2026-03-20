export class Email {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
  }

  public static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  public getValue(): string {
    return this.value;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
