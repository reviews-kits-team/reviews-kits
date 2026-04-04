import { DomainError } from './DomainError';

export class SlugAlreadyInUseError extends DomainError {
  constructor(slug: string) {
    super(`The slug "${slug}" is already in use by another form.`);
  }
}
