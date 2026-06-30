import { validatePunycode } from '../src/validators/punycode.js';

describe('Punycode Validator', () => {
  it('should pass normal domains', () => {
    const result = validatePunycode('https://example.com');
    expect(result.safe).toBe(true);
    expect(result.scoreImpact).toBe(0);
  });

  it('should detect safe punycode domains but warn', () => {
    // 'münchen.de' -> 'xn--mnchen-3ya.de'
    const result = validatePunycode('https://xn--mnchen-3ya.de');
    expect(result.safe).toBe(false);
    expect(result.scoreImpact).toBe(30);
    expect(result.message).toContain('Warning: URL uses Punycode');
  });

  it('should detect suspicious homograph characters', () => {
    // 'epic.com' with pure cyrillic 'еріс' -> 'xn--e1awd7f.com'
    const result = validatePunycode('https://xn--e1awd7f.com');
    expect(result.safe).toBe(false);
    expect(result.scoreImpact).toBe(80);
    expect(result.message).toContain('Suspicious: Label "еріс" contains confusable Unicode characters.');
  });

  it('should detect mixed scripts in a single label', () => {
    // cyrillic 'a' (U+0430) mixed with latin 'pple.com' -> 'xn--pple-43d.com'
    const result = validatePunycode('https://xn--pple-43d.com');
    expect(result.safe).toBe(false);
    expect(result.scoreImpact).toBe(100);
    expect(result.message).toContain('Mixed-script label');
  });
});
