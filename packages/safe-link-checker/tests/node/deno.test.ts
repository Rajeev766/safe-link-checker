import { verifyLink } from '@safe-link-checker/node-runtime';

describe('Deno verifyLink', () => {
  it('should verify URLs with Node compat layer in Deno', async () => {
    const result = await verifyLink('https://example.com');
    expect(result.safe).toBe(true);
  });
});
