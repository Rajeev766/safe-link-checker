import type { CheckResult } from '../types/index.js';
import punycode from 'punycode';

export function validatePunycode(urlStr: string): CheckResult {
  let hostname: string;
  try {
    hostname = new URL(urlStr).hostname;
  } catch {
    return { name: 'Punycode Validator', safe: true, scoreImpact: 0, message: 'Invalid URL.' };
  }

  if (!hostname.includes('xn--')) {
    return {
      name: 'Punycode Validator',
      safe: true,
      scoreImpact: 0,
      message: 'No Punycode detected.',
    };
  }

  const labels = hostname.split('.');
  for (const label of labels) {
    if (label.startsWith('xn--')) {
      const decodedLabel = punycode.toUnicode(label);
      
      const hasLatin = /[a-zA-Z]/.test(decodedLabel);
      const hasCyrillic = /[\u0400-\u04FF]/.test(decodedLabel);
      const hasGreek = /[\u0370-\u03FF]/.test(decodedLabel);
      
      const scripts = [hasLatin, hasCyrillic, hasGreek].filter(Boolean);
      
      if (scripts.length > 1) {
        return {
          name: 'Punycode Validator',
          safe: false,
          scoreImpact: 100,
          message: `High risk: Mixed-script label "${decodedLabel}" detected (homograph attack indicator).`,
        };
      }
      
      // Look for suspicious unicode characters often used in homograph attacks
      // E.g., Cyrillic 'a' (U+0430), Cyrillic 'e' (U+0435), etc.
      if (/[\u0430\u0435\u043E\u0440\u0441\u0443\u0445\u03BF\u03C1]/.test(decodedLabel)) {
        return {
          name: 'Punycode Validator',
          safe: false,
          scoreImpact: 80,
          message: `Suspicious: Label "${decodedLabel}" contains confusable Unicode characters.`,
        };
      }
    }
  }

  const decodedHost = punycode.toUnicode(hostname);
  return {
    name: 'Punycode Validator',
    safe: false,
    scoreImpact: 30, // Base impact for xn-- domains
    message: `Warning: URL uses Punycode (xn--). Decoded: ${decodedHost}`,
  };
}
