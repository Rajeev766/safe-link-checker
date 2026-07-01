import { validateUrl } from '@safe-link-checker/node-runtime';

describe('Validators', () => {
  describe('validateUrl', () => {
    it('should accept valid HTTP and HTTPS URLs', () => {
      const resHttps = validateUrl('https://example.com');
      expect(resHttps.safe).toBe(true);
      expect(resHttps.scoreImpact).toBe(0);

      const resHttp = validateUrl('http://sub.domain.org/path?query=1');
      expect(resHttp.safe).toBe(true);
      expect(resHttp.scoreImpact).toBe(0);
    });

    it('should reject unsupported protocols', () => {
      const protocols = ['javascript:alert(1)', 'data:text/html,abc', 'ftp://example.com', 'file:///etc/passwd', 'mailto:test@example.com'];
      for (const p of protocols) {
        const res = validateUrl(p);
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toMatch(/Unsupported protocol|Failed syntax validation/);
      }
    });

    it('should reject malformed URLs', () => {
      const malformed = ['http://', 'https://[invalid-ip]', 'not-a-url'];
      for (const m of malformed) {
        const res = validateUrl(m);
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toBeDefined();
      }
    });

    it('should reject URLs with missing hostname', () => {
      const res = validateUrl('http:///path');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('Failed syntax validation');
    });
  });
});


