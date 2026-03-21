import { randomBytes } from 'node:crypto';

export class ApiKeyGenerator {
  /**
   * Generates a prefixed API key.
   * Format: rk_[pk/sk]_[live/test]_[random]
   */
  public static generate(type: 'public' | 'secret', environment: 'live' | 'test' = 'live'): string {
    const prefix = `rk_${type === 'public' ? 'pk' : 'sk'}_${environment}_`;
    const randomPart = randomBytes(24).toString('hex');
    return `${prefix}${randomPart}`;
  }

  public static isPublicKey(key: string): boolean {
    return key.startsWith('rk_pk_');
  }

  public static isSecretKey(key: string): boolean {
    return key.startsWith('rk_sk_');
  }
}
