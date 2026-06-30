import { verifyLink } from '../src/verify.js';

describe('verifyLink orchestration', () => {
  it('should run placeholder checks successfully', async () => {
    const result = await verifyLink('https://example.com');
    expect(result.safe).toBe(true);
    expect(result.score).toBe(100);
    expect(result.riskLevel).toBe('SAFE');
  });
});
