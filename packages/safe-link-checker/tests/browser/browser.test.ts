import { verifyLink } from '@safe-link-checker/browser-runtime';

describe('Browser verifyLink', () => {
  it('should verify safe URLs correctly in a browser environment', async () => {
    const result = await verifyLink('https://google.com');
    expect(result.safe).toBe(true);
  });
});
