import { verifyLink } from '@safe-link-checker/node-runtime';

describe('verifyLink orchestration', () => {
  it('should run placeholder checks successfully', async () => {
    const result = await verifyLink('https://example.com');
    expect(result.safe).toBe(true);
    expect(result.trustScore).toBe(100);
    expect(result.riskLevel).toBe('SAFE');
  });
});
