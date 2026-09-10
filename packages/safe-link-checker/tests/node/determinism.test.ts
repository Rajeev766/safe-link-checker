/**
 * Determinism regression tests.
 *
 * Verifies that the local verification path (no network, no cache) is
 * deterministic: calling verify() twice on the same URL with the same config
 * must produce identical scores, decision, and classification.
 *
 * These tests exist to catch future regressions if a non-deterministic element
 * (Math.random, Date-based scoring, mutable global state, etc.) is inadvertently
 * introduced into the scoring or policy engine.
 */
import { SafeLinkChecker, LRUCache, type VerificationResult } from '@safe-link-checker/node-runtime';

const DETERMINISTIC_URLS = [
  'https://example.com',
  'https://paypal-secure-login.xyz',
  'http://localhost',
  'https://g00gle.com',
];

describe('Determinism — local verification path', () => {
  let checker: SafeLinkChecker;

  beforeAll(() => {
    // Isolated checker: no providers, no network checks, cache disabled
    checker = new SafeLinkChecker({
      cache: false,
      checkHttps: false,
    });
  });

  it.each(DETERMINISTIC_URLS)(
    'same trustScore and decision for "%s" on repeated calls',
    async (url) => {
      const result1 = await checker.verify(url, { checkHttps: false });
      const result2 = await checker.verify(url, { checkHttps: false });

      // Core scoring fields must be identical
      expect(result2.trustScore).toBe(result1.trustScore);
      expect(result2.riskScore).toBe(result1.riskScore);
      expect(result2.confidence).toBe(result1.confidence);
      expect(result2.decision).toBe(result1.decision);
      expect(result2.classification).toBe(result1.classification);
      expect(result2.safe).toBe(result1.safe);
      expect(result2.severity).toBe(result1.severity);

      // Evidence count must be the same (same checks triggered)
      expect(result2.evidence.length).toBe(result1.evidence.length);
    }
  );
});
