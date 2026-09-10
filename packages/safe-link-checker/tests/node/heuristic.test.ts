import { validateHeuristics } from '@safe-link-checker/node-runtime';

describe('Heuristics Validator', () => {
  it('should detect suspicious TLDs', () => {
    const res = validateHeuristics('http://example.tk');
    expect(res.safe).toBe(false);
    expect(res.metadata?.flags).toContain('suspicious_tld');
  });

  it('should detect suspicious keywords', () => {
    const res = validateHeuristics('http://secure-login-update.com');
    expect(res.safe).toBe(false);
    expect(res.metadata?.flags).toContain('suspicious_keyword:login');
    expect(res.metadata?.flags).toContain('suspicious_keyword:secure');
  });

  it('should detect excessive subdomains', () => {
    const res = validateHeuristics('http://a.b.c.d.example.com');
    expect(res.safe).toBe(false);
    expect(res.metadata?.flags).toContain('excessive_subdomains');
  });

  it('should detect lookalike domains', () => {
    // 1-char edit distance
    const res = validateHeuristics('http://goggle.com');
    expect(res.safe).toBe(false);
    expect(res.metadata?.flags).toContain('lookalike_domain:google');
    
    // Obfuscated
    const res2 = validateHeuristics('http://g00gle.com');
    expect(res2.safe).toBe(false);
    expect(res2.metadata?.flags).toContain('lookalike_domain:google');
  });

  it('should detect excessive and double encoding', () => {
    // Excessive encoding
    const res1 = validateHeuristics('http://example.com/path?q=%20%20%20%20%20%20%20%20%20%20%20');
    expect(res1.safe).toBe(false);
    expect(res1.metadata?.flags).toContain('excessive_encoding');

    // Double encoding
    const res2 = validateHeuristics('http://example.com/path?q=%2520');
    expect(res2.safe).toBe(false);
    expect(res2.metadata?.flags).toContain('double_encoding');
  });

  it('should detect excessive URL length', () => {
    const longUrl = 'http://example.com/' + 'a'.repeat(2000);
    const res = validateHeuristics(longUrl);
    expect(res.safe).toBe(false);
    expect(res.metadata?.flags).toContain('excessive_length');
  });

  it('should pass benign domains', () => {
    const res = validateHeuristics('https://google.com');
    expect(res.safe).toBe(true);
    expect(res.metadata?.flags).toEqual([]);
    
    const res2 = validateHeuristics('https://example.com/path');
    expect(res2.safe).toBe(true);
  });
});
