import type { Provider, CheckResult, VerifyOptions } from '@safe-link-checker/types';

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
        
        // Pass our own abort signal down if not provided
        const mergedOptions = { ...options, signal: options?.signal || controller.signal };
        
        const result = await this.doCheck(url, mergedOptions);
        clearTimeout(timeoutId);
        
        if (options?.hooks?.onProvider && result) {
          options.hooks.onProvider(this.name, result);
        }
        
        return result;
      } catch (error: any) {
        if (error.name === 'AbortError' || attempt === this.retries) {
          // Log or handle timeout/error silently for provider
          return null;
        }
        attempt++;
        // minimal backoff
        await new Promise(r => setTimeout(r, 100 * attempt));
      }
    }
    return null;
  }
}
