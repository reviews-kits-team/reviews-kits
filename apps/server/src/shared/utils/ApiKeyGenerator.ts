import { randomBytes, createHash } from 'node:crypto';

export class ApiKeyGenerator {
  /**
   * Generates a prefixed API key.
   * Format: rk_[pk/sk]_[live/test]_[random]
   */
  public static generate(type: 'public' | 'secret', environment: 'live' | 'test' = 'live'): { rawKey: string, keyHash: string, keyPrefix: string } {
    const prefix = `rk_${type === 'public' ? 'pk' : 'sk'}_${environment}_`;
    const randomPart = randomBytes(24).toString('hex');
    const rawKey = `${prefix}${randomPart}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 16);
    return { rawKey, keyHash, keyPrefix };
  }

  public static isPublicKey(key: string): boolean {
    return key.startsWith('rk_pk_');
  }

  public static isSecretKey(key: string): boolean {
    return key.startsWith('rk_sk_');
  }

  /**
   * Generates a public ID for a resource (e.g., rk_frm_...).
   */
  public static generatePublicId(prefix: string, environment: 'live' | 'test' = 'live'): string {
    const fullPrefix = `rk_${prefix}_${environment}_`;
    const randomPart = randomBytes(12).toString('hex'); // Shorter than API keys
    return `${fullPrefix}${randomPart}`;
  }
}
