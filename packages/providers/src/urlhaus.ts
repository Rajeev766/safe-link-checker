import type { CheckResult, VerifyOptions } from '@safe-link-checker/types';
import { BaseProvider } from './base.js';

export class URLHausProvider extends BaseProvider {
  name = 'URLHaus';

  protected async doCheck(url: string, _options?: VerifyOptions): Promise<CheckResult | null> {
    try {
      const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url })
      });
      
      if (!response.ok) {
        return { name: this.name, safe: true, scoreImpact: 0, confidence: 0, category: 'provider', severity: 'info', title: 'URLHaus Error', message: 'URLHaus query failed' };
      }

      const data = await response.json();
      if (data.query_status === 'ok') {
        return {
          name: this.name,
          safe: false,
          scoreImpact: 100,
          confidence: 95,
          category: 'provider',
          severity: 'critical',
          fatal: true,
          message: `Found in URLHaus malware database: ${data.threat}`
        };
      }
      
      return {
        name: this.name,
        safe: true,
        scoreImpact: 0,
        confidence: 95,
        category: 'provider',
        severity: 'info',
        message: 'Not listed in URLHaus'
      };
    } catch {
      return { name: this.name, safe: true, scoreImpact: 0, confidence: 0, category: 'provider', severity: 'info', title: 'URLHaus Error', message: 'URLHaus query failed due to network error' };
    }
  }
}
