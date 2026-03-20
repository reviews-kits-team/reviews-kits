export class Rating {
  private constructor(private readonly value: number) {
    if (!this.isValid(value)) {
      throw new Error(`Rating must be between 1 and 5, got: ${value}`);
    }
  }

  public static create(value: number): Rating {
    return new Rating(value);
  }

  public getValue(): number {
    return this.value;
  }

  private isValid(rating: number): boolean {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
  }

  public equals(other: Rating): boolean {
    return this.value === other.value;
  }
}
