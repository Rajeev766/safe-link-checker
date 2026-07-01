import { LRUCache } from '@safe-link-checker/node-runtime';
import type { VerificationResult } from '@safe-link-checker/node-runtime';

describe('LRUCache', () => {
  it('should store and retrieve items', () => {
    const cache = new LRUCache<VerificationResult>({ maxSize: 2, ttlMs: 1000 });
    const dummy = { url: 'http://a.com' } as VerificationResult;
    cache.set('http://a.com', dummy);
    
    expect(cache.get('http://a.com')).toBe(dummy);
  });

  it('should evict oldest item when max size is reached', () => {
    const cache = new LRUCache<VerificationResult>({ maxSize: 2 });
    cache.set('a', { url: 'a' } as VerificationResult);
    cache.set('b', { url: 'b' } as VerificationResult);
    cache.set('c', { url: 'c' } as VerificationResult);

    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeTruthy();
    expect(cache.get('c')).toBeTruthy();
  });

  it('should respect TTL', (done) => {
    const cache = new LRUCache<VerificationResult>({ ttlMs: 100 });
    cache.set('a', { url: 'a' } as VerificationResult);

    setTimeout(() => {
      expect(cache.get('a')).toBeNull();
      done();
    }, 150);
  });
});
