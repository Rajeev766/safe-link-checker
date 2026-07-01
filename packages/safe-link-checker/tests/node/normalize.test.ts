import { normalizeLink } from '@safe-link-checker/node-runtime';

describe('normalizeLink', () => {
  it('should trim whitespace', () => {
    expect(normalizeLink('  http://example.com  ')).toBe('http://example.com');
  });

  it('should prepend http if no protocol is present', () => {
    expect(normalizeLink('example.com')).toBe('http://example.com');
  });

  it('should sort query parameters', () => {
    expect(normalizeLink('https://example.com?b=2&a=1')).toBe('https://example.com/?a=1&b=2');
  });

  it('should lowercase hostname', () => {
    expect(normalizeLink('HTTPS://EXAMPLE.COM/Path')).toBe('https://example.com/Path');
  });

  it('should remove trailing slash', () => {
    expect(normalizeLink('https://example.com/path/')).toBe('https://example.com/path');
  });

  it('should remove fragments', () => {
    expect(normalizeLink('https://example.com/path#fragment')).toBe('https://example.com/path');
  });

  it('should remove duplicate slashes in path', () => {
    expect(normalizeLink('https://example.com/foo//bar///baz')).toBe('https://example.com/foo/bar/baz');
  });

  it('should conditionally remove common tracking parameters', () => {
    const url = 'https://example.com?utm_source=google&fbclid=123&gclid=456&keep=me';
    
    // By default, do not remove
    expect(normalizeLink(url)).toContain('utm_source');
    expect(normalizeLink(url)).toContain('fbclid');
    expect(normalizeLink(url)).toContain('gclid');
    expect(normalizeLink(url)).toContain('keep=me');

    // When requested, remove them
    const normalized = normalizeLink(url, { removeTrackingParams: true });
    expect(normalized).not.toContain('utm_source');
    expect(normalized).not.toContain('fbclid');
    expect(normalized).not.toContain('gclid');
    expect(normalized).toBe('https://example.com/?keep=me');
  });
});


