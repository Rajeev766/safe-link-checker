import { verifyLink } from '@safe-link-checker/browser-runtime';

describe('React Native verifyLink', () => {
  it('should verify URLs in React Native without Node built-ins', async () => {
    const result = await verifyLink('https://example.com');
    expect(result.safe).toBe(true);
  });
});
