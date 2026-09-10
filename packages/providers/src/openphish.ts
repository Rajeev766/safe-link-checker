import type { CheckResult, VerifyOptions } from '@safe-link-checker/types';
import { BaseProvider } from './base.js';

/**
 * A local heuristic phishing filter that detects obviously suspicious hostname
 * patterns (e.g. hostnames containing "phish" or "login-update").
 *
 * @deprecated
 * Despite its name, **this class does NOT query the OpenPhish API** and provides
 * no real OpenPhish threat feed coverage. It is a local string-matching heuristic
 * only. This provider exists for backward compatibility and will be replaced by a
 * real OpenPhish Community Feed integration in a future release.
 *
 * For genuine phishing feed coverage, use `URLHausProvider` or implement a
 * custom `Provider` that queries the OpenPhish feed at:
 * https://openphish.com/feed.txt
 *
 * To suppress this warning, pass `{ suppressDeprecationWarning: true }` to the
 * constructor.
 */
export class OpenPhishProvider extends BaseProvider {
  name = 'OpenPhish';

  constructor(options?: { priority?: number; timeoutMs?: number; retries?: number; suppressDeprecationWarning?: boolean }) {
    super(options);
    if (!options?.suppressDeprecationWarning && process.env['NODE_ENV'] !== 'test') {
      console.warn(
        '[safe-link-checker] OpenPhishProvider is deprecated: this class does NOT query ' +
        'the OpenPhish API. It is a local hostname-pattern heuristic only and provides ' +
        'no real threat feed coverage. See the JSDoc for alternatives. ' +
        'Pass { suppressDeprecationWarning: true } to suppress this warning.'
      );
    }
  }

  protected async doCheck(url: string, _options?: VerifyOptions): Promise<CheckResult | null> {
    try {
      const parsed = new URL(url);
      // NOTE: This is a local string match — it does NOT call the OpenPhish API.
      // It serves as a basic pattern-based catch for obviously named phishing domains.
      if (parsed.hostname.includes('phish') || parsed.hostname.includes('login-update')) {
        return {
          name: this.name,
          safe: false,
          scoreImpact: 50,
          confidence: 60, // Reduced confidence: this is a heuristic, not a feed lookup
          category: 'provider',
          severity: 'high',
          fatal: true,
          message: 'Hostname matches local phishing pattern (heuristic — not a real OpenPhish lookup)'
        };
      }
      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        confidence: 30, // Low confidence: the real OpenPhish feed was not consulted
        category: 'provider',
        severity: 'info',
        message: 'No local phishing pattern match (heuristic — not a real OpenPhish lookup)'
      };
    } catch {
      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        confidence: 0,
        category: 'provider',
        severity: 'info',
        message: 'OpenPhish heuristic check failed'
      };
    }
  }
}
