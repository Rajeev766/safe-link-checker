import { SafeLinkChecker } from '@safe-link-checker/node-runtime';
import type { VerificationResult } from '@safe-link-checker/core';

describe('Security Report API', () => {
  let checker: SafeLinkChecker;

  beforeEach(() => {
    checker = new SafeLinkChecker({ checkHttps: false });
  });

  it('should include all required enterprise security fields', async () => {
    const result = await checker.verify('https://example.com');
    
    // Core attributes
    expect(result.safe).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.trustScore).toBeDefined();
    expect(result.riskScore).toBeDefined();
    expect(result.classification).toBeDefined();
    
    // Complex objects
    expect(result.threat).toBeDefined();
    expect(result.badge).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.performance).toBeDefined();
    
    // Methods (non-enumerable)
    expect(typeof result.isSafe).toBe('function');
    expect(typeof result.shouldWarn).toBe('function');
    expect(typeof result.shouldBlock).toBe('function');
    expect(typeof result.toJSON).toBe('function');
    expect(typeof result.toString).toBe('function');
    expect(typeof result.toMarkdown).toBe('function');
    expect(typeof result.toHTML).toBe('function');
    expect(typeof result.export).toBe('function');
  });

  it('should provide correct serialization with toJSON without functions', async () => {
    const result = await checker.verify('https://example.com');
    const json = result.toJSON();
    
    expect(json.safe).toBe(result.safe);
    expect(json.isSafe).toBeUndefined();
    expect(json.toJSON).toBeUndefined();
    
    // JSON.stringify should natively drop the methods because they are non-enumerable
    const str = JSON.stringify(result);
    expect(str).not.toContain('"isSafe"');
    expect(str).not.toContain('"toJSON"');
  });

  it('should generate markdown and HTML exports', async () => {
    const result = await checker.verify('https://example.com');
    
    const md = result.toMarkdown();
    expect(md).toContain('# Security Report: https://example.com');
    expect(md).toContain('**Decision:** ALLOW');
    
    const html = result.toHTML();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Security Report: https://example.com</title>');
    expect(html).toContain('ALLOW');
    
    // Export helper
    expect(result.export('json')).toBe(result.toString());
    expect(result.export('markdown')).toBe(md);
    expect(result.export('html')).toBe(html);
  });
  
  it('should map old backward compatible fields', async () => {
    const result = await checker.verify('https://example.com');
    
    // Test backward compatibility specifically supported in the types
    expect(result.fromCache).toBeDefined(); // This is just checking anything old
  });
});
