import { SafeLinkChecker } from '@safe-link-checker/node-runtime';
import { LRUCache } from '@safe-link-checker/node-runtime';
import type { Provider, CheckResult, VerifyOptions, VerificationResult } from '@safe-link-checker/node-runtime';

class MockProvider implements Provider {
  name = 'MockProvider';
  async check(url: string, _options?: VerifyOptions): Promise<CheckResult | null> {
    if (url.includes('bad')) {
      return {
        name: this.name,
        safe: false,
        scoreImpact: 50,
        message: 'Bad stuff found',
      };
    }
    return {
      name: this.name,
      safe: true,
      scoreImpact: 0,
      message: 'All good',
    };
  }
}

describe('SafeLinkChecker', () => {
  it('should run core validations', async () => {
    const checker = new SafeLinkChecker({ cache: new LRUCache<VerificationResult>() });
    const result = await checker.verify('https://example.com', { checkHttps: false });
    expect(result.safe).toBe(true);
    expect(result.trustScore).toBe(100);
  });

  it('should run provider plugins', async () => {
    const checker = new SafeLinkChecker({ cache: new LRUCache<VerificationResult>() }).use(new MockProvider());
    
    // Good URL
    const goodResult = await checker.verify('https://example.com', { checkHttps: false });
    expect(goodResult.safe).toBe(true);
    expect(goodResult.checks.some(c => c.name === 'MockProvider')).toBe(true);
    
    // Bad URL
    const badResult = await checker.verify('https://bad.com', { checkHttps: false });
    expect(badResult.safe).toBe(false);
    expect(badResult.trustScore).toBe(50); // Since MockProvider deducts 50
    expect(badResult.reasons).toContain('Bad stuff found');
  });

  it('should support caching', async () => {
    const checker = new SafeLinkChecker({ cache: new LRUCache<VerificationResult>() }).use(new MockProvider());
    
    const res1 = await checker.verify('https://example.com', { checkHttps: false });
    expect(res1.fromCache).toBe(false);

    const res2 = await checker.verify('https://example.com', { checkHttps: false });
    expect(res2.fromCache).toBe(true);
  });
});
