import { verifyLink } from '@safe-link-checker/node-runtime';

describe('Bun verifyLink', () => {
  it('should verify URLs with full Node.js compat in Bun', async () => {
    const result = await verifyLink('https://example.com');
    expect(result.safe).toBe(true);
  });
});
