import { verifyLink } from '@safe-link-checker/browser-runtime';

describe('Expo verifyLink', () => {
  it('should verify URLs in Expo without Node built-ins', async () => {
    const result = await verifyLink('https://example.com');
    expect(result.safe).toBe(true);
  });
});
