import { validateHeuristics } from '../src/validators/heuristic.js';

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

  it('should pass benign domains', () => {
    const res = validateHeuristics('https://google.com');
    expect(res.safe).toBe(true);
    expect(res.metadata?.flags).toEqual([]);
    
    const res2 = validateHeuristics('https://example.com/path');
    expect(res2.safe).toBe(true);
  });
});
