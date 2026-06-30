import { validateShortener } from '../src/validators/shortener.js';

describe('Shortener Validator', () => {
  it('should detect known shorteners', () => {
    const result = validateShortener('https://bit.ly/12345');
    expect(result.safe).toBe(false);
    expect(result.scoreImpact).toBe(10);
    expect(result.metadata?.isShortener).toBe(true);
  });

  it('should not flag normal URLs', () => {
    const result = validateShortener('https://example.com/path');
    expect(result.safe).toBe(true);
    expect(result.scoreImpact).toBe(0);
    expect(result.metadata?.isShortener).toBe(false);
  });

  it('should detect custom shorteners', () => {
    const result = validateShortener('https://my-short.url/abcd', ['my-short.url']);
    expect(result.safe).toBe(false);
    expect(result.scoreImpact).toBe(10);
    expect(result.metadata?.isShortener).toBe(true);
  });
});
