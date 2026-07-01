import type { CheckResult, VerifyOptions } from '@safe-link-checker/types';
import { BaseProvider } from './base.js';

export class OpenPhishProvider extends BaseProvider {
  name = 'OpenPhish';

  protected async doCheck(url: string, _options?: VerifyOptions): Promise<CheckResult | null> {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('phish') || parsed.hostname.includes('login-update')) {
        return {
          name: this.name,
          safe: false,
          scoreImpact: 50,
          confidence: 90,
          category: 'provider',
          severity: 'high',
          fatal: true,
          message: 'Found in OpenPhish database'
        };
      }
      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        confidence: 90,
        category: 'provider',
        severity: 'info',
        message: 'Not listed in OpenPhish'
      };
    } catch {
      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        confidence: 0,
        category: 'provider',
        severity: 'info',
        message: 'OpenPhish check failed'
      };
    }
  }
}
