/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult } from '@safe-link-checker/types';
import punycode from 'punycode';

export function validatePunycode(urlStr: string): CheckResult {
  let hostname: string;
  try {
    hostname = new URL(urlStr).hostname;
  } catch {
    return { name: 'Punycode Validator', detector: 'punycode-parser', category: 'domain', severity: 'info', safe: true, scoreImpact: 0, title: 'Unparseable URL', message: 'Invalid URL.' };
  }

  if (!hostname.includes('xn--')) {
    return {
      name: 'Punycode Validator',
      detector: 'punycode-clean',
      category: 'domain',
      severity: 'info',
      safe: true,
      scoreImpact: 0,
      title: 'Standard Domain',
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
          detector: 'punycode-mixed-script',
          category: 'domain',
          severity: 'critical',
          safe: false,
          scoreImpact: 100,
          title: 'Mixed-Script Homograph Attack',
          message: `High risk: Mixed-script label "${decodedLabel}" detected (homograph attack indicator).`,
          fatal: true,
        };
      }
      
      // Look for suspicious unicode characters often used in homograph attacks
      // Includes Cyrillic 'a' (U+0430), Cyrillic 'e' (U+0435), zero-width spaces (U+200B, U+200C, U+200D), etc.
      if (/[\u0430\u0435\u043E\u0440\u0441\u0443\u0445\u03BF\u03C1\u200B\u200C\u200D\uFEFF\u202A-\u202E]/u.test(decodedLabel)) {
        return {
          name: 'Punycode Validator',
          detector: 'punycode-confusable',
          category: 'domain',
          severity: 'critical',
          safe: false,
          scoreImpact: 100, // Elevated severity for explicit confusable/invisible characters
          title: 'Confusable Characters Detected',
          message: `High risk: Label "${decodedLabel}" contains highly suspicious confusable or invisible Unicode characters.`,
          fatal: true,
        };
      }
    }
  }

  const decodedHost = punycode.toUnicode(hostname);
  return {
    name: 'Punycode Validator',
    detector: 'punycode-usage',
    category: 'domain',
    severity: 'medium',
    safe: false,
    scoreImpact: 30, // Base impact for xn-- domains
    title: 'Internationalized Domain Name',
    message: `Warning: URL uses Punycode (xn--). Decoded: ${decodedHost}`,
  };
}
