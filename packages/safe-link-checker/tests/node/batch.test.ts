import { SafeLinkChecker } from '@safe-link-checker/node-runtime';
import { LRUCache } from '@safe-link-checker/node-runtime';
import type { VerificationResult } from '@safe-link-checker/node-runtime';

describe('Batch Verification', () => {
  it('should verify multiple URLs concurrently and keep order', async () => {
    const checker = new SafeLinkChecker({ cache: new LRUCache<VerificationResult>() });
    
    const urls = [
      'https://example.com',
      'https://google.com',
      'https://bad.com',
      'http://test.tk'
    ];

    const results = await checker.verifyLinks(urls, { checkHttps: false });
    
    expect(results.length).toBe(4);
    expect(results[0]!.normalizedUrl).toBe('https://example.com');
    expect(results[1]!.normalizedUrl).toBe('https://google.com');
    expect(results[2]!.normalizedUrl).toBe('https://bad.com');
    expect(results[3]!.normalizedUrl).toBe('http://test.tk');
  });
});
