import { test, expect, describe, jest } from '@jest/globals';
import fc from 'fast-check';
import { SafeLinkChecker } from '../../src/index.js';

// Disable network requests for fuzzing to prevent timeouts
jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(new Response('OK')));

describe('Fuzz Testing - Core Engine', () => {
  const checker = new SafeLinkChecker({ policy: 'offline', cache: false });

  test('URL Parser should never crash on random strings', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (randomString) => {
        try {
          const result = await checker.verify(randomString);
          expect(result.safe).toBeDefined();
        } catch (e: unknown) {
          expect(['SafeLinkError', 'TimeoutError', 'TypeError']).toContain((e as Error).name);
        }
      }),
      { numRuns: 100 }
    );
  }, 20000);

  test('Unicode & Punycode normalization should never throw unhandled exceptions', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (unicodeString) => {
        try {
          const url = `https://example.com/${unicodeString}`;
          const result = await checker.verify(url);
          expect(result.safe).toBeDefined();
        } catch (e: unknown) {
          expect(['SafeLinkError', 'TimeoutError', 'TypeError']).toContain((e as Error).name);
        }
      }),
      { numRuns: 100 }
    );
  }, 20000);
});
