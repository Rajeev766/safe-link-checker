import { test, expect, describe } from '@jest/globals';
import { SafeLinkChecker } from '../../src/index.js';

describe('Penetration & Offensive Testing', () => {
  const checker = new SafeLinkChecker({ policy: 'strict', cache: false });

  test('ReDoS (Regex Denial of Service) protection', async () => {
    // Attempting to trigger catastrophic backtracking in URL parsing
    const payload = 'http://' + 'a'.repeat(50000) + '!\x00';
    const start = performance.now();
    
    const result = await checker.verify(payload);
    
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // Should resolve/reject very fast, no hanging
    expect(result.safe).toBe(false);
  });

  test('Malformed percent encoding', async () => {
    const payload = 'https://example.com/login?token=%XX%ZZ%1';
    const result = await checker.verify(payload);
    // Should gracefully handle it, probably blocking or stripping it depending on normalization
    expect(result.safe).toBeDefined();
  });

  test('Extremely long URLs (Buffer exhaustion)', async () => {
    const payload = 'https://example.com/?q=' + 'A'.repeat(100000);
    const result = await checker.verify(payload);
    expect(result.safe).toBe(false); // Likely rejected by length limits
    expect(result.decision).toBe('BLOCK');
  });

  test('Homograph attacks with mixed scripts', async () => {
    const payload = 'https://www.payp\u0430l.com'; // Cyrillic 'a'
    const result = await checker.verify(payload);
    expect(result.safe).toBe(false);
    expect(result.evidence.some((e: any) => e.id === 'punycode-validator')).toBe(true);
  });

  test('SSRF Bypass Attempt (IPv4-Mapped IPv6 Address)', async () => {
    const payload = 'http://[0:0:0:0:0:ffff:127.0.0.1]/';
    const result = await checker.verify(payload);
    expect(result.safe).toBe(false);
    expect(result.evidence.some((e: any) => e.id === 'ip-validator')).toBe(true);
  });
});
