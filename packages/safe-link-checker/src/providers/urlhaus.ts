import axios from 'axios';
import type { CheckResult, Provider, VerifyOptions } from '../types/index.js';
import { LRUCache } from '../cache/lru.js';

export class URLHausProvider implements Provider {
  name = 'URLHaus Provider';
  private cache = new LRUCache<CheckResult>({ maxSize: 1000, ttlMs: 1000 * 60 * 60 * 24 }); // 24h cache

  async check(url: string, options?: VerifyOptions): Promise<CheckResult | null> {
    const cached = this.cache.get(url);
    if (cached) {
      return cached;
    }
    
    const result = await this.doCheck(url, options);
    if (result) {
      this.cache.set(url, result);
    }
    return result;
  }

  private async doCheck(url: string, options?: VerifyOptions): Promise<CheckResult | null> {
    try {
      const form = new URLSearchParams();
      form.append('url', url);

      const axiosConfig: any = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 3000,
      };
      if (options?.signal) {
        axiosConfig.signal = options.signal;
      }
      const response = await axios.post('https://urlhaus-api.abuse.ch/v1/url/', form.toString(), axiosConfig);

      if (response.data && response.data.query_status === 'ok') {
        return {
          name: this.name,
          safe: false,
          scoreImpact: 100,
          weight: 100, // Very high severity
          message: 'URL is listed on URLHaus as a known malware distribution site.',
          metadata: { threat: response.data.threat },
        };
      }

      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        message: 'URL not found in URLHaus database.',
      };
    } catch {
      // Fail gracefully
      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        message: 'URLHaus check failed or timed out. Skipping.',
      };
    }
  }
}
