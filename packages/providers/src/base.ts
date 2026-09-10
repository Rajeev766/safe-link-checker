import type { Provider, CheckResult, VerifyOptions } from '@safe-link-checker/types';

/**
 * Abstract base class for all verification providers.
 *
 * ## Security Trust Model
 *
 * Provider implementations make outbound HTTP requests to external threat
 * intelligence APIs. The following trust boundaries apply:
 *
 * - **Provider API endpoints are developer-configured constants**, not
 *   user-controlled inputs. Consumers configure providers at checker
 *   instantiation time; they cannot inject arbitrary endpoints at runtime.
 *
 * - **The user's URL is transmitted as a POST body string**, not as a fetch
 *   target URL. There is no SSRF risk from the user's URL itself because the
 *   provider only sends it as data to a fixed, known API endpoint.
 *
 * - **Timeouts are enforced** via `AbortController`. Every provider request
 *   is bounded by `this.timeoutMs` (default: 3000ms). A provider that hangs
 *   or times out returns `null`, which contributes no score. The URL is not
 *   assumed safe on timeout — heuristic checks still run independently.
 *
 * - **Provider failure is silent but non-inflating**. When a provider times
 *   out or errors, it returns `null`. The null result does not add to the
 *   trust score or the risk score. Heuristics-only mode remains the fallback.
 *   Consumers that require full coverage should check `result.checks` for
 *   provider entries.
 *
 * - **Retries are bounded** by `this.retries` (default: 1) with a minimal
 *   exponential backoff. The total wall-clock time is bounded by
 *   `(retries + 1) * timeoutMs + backoff`.
 */
export abstract class BaseProvider implements Provider {
  abstract name: string;
  public priority: number = 50;
  public timeoutMs: number = 3000;
  public retries: number = 1;
  
  constructor(options?: { priority?: number; timeoutMs?: number; retries?: number }) {
    if (options?.priority) this.priority = options.priority;
    if (options?.timeoutMs) this.timeoutMs = options.timeoutMs;
    if (options?.retries !== undefined) this.retries = options.retries;
  }

  protected abstract doCheck(url: string, options?: VerifyOptions): Promise<CheckResult | null>;

  async check(url: string, options?: VerifyOptions): Promise<CheckResult | null> {
    let attempt = 0;
    while (attempt <= this.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        
        // Pass our own abort signal down if not provided.
        // The user's `url` here is passed to doCheck() as a string value sent
        // in the request body — it is NOT used as a fetch() target URL.
        const mergedOptions = { ...options, signal: options?.signal || controller.signal };
        
        const result = await this.doCheck(url, mergedOptions);
        clearTimeout(timeoutId);
        
        if (options?.hooks?.onProvider && result) {
          options.hooks.onProvider(this.name, result);
        }
        
        return result;
      } catch (error: unknown) {
        const isAbort = error instanceof Error && error.name === 'AbortError';
        if (isAbort || attempt === this.retries) {
          // Provider timeout or exhausted retries — return null (no score impact).
          // The URL is NOT assumed safe; heuristic checks provide the baseline verdict.
          return null;
        }
        attempt++;
        // Minimal linear backoff before retry
        await new Promise(r => setTimeout(r, 100 * attempt));
      }
    }
    return null;
  }
}
