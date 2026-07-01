import type { CheckResult } from '@safe-link-checker/types';

export class RedisCache {
  constructor(private client: any, private prefix = 'slc:') {}

  async get(key: string): Promise<CheckResult | null> {
    if (!this.client) return null;
    const data = await this.client.get(this.prefix + key);
    if (!data) return null;
    try {
      return JSON.parse(data) as CheckResult;
    } catch {
      return null;
    }
  }

  async set(key: string, result: CheckResult, ttlSeconds = 3600): Promise<void> {
    if (!this.client) return;
    await this.client.set(this.prefix + key, JSON.stringify(result), 'EX', ttlSeconds);
  }
}
