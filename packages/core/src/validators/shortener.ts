/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult } from '@safe-link-checker/types';

const DEFAULT_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'shorturl.at',
  'rb.gy',
  'rebrand.ly',
  'cutt.ly',
  'tiny.cc',
]);

export function validateShortener(urlStr: string, customShorteners: string[] = []): CheckResult {
  let hostname: string;
  try {
    hostname = new URL(urlStr).hostname.toLowerCase();
  } catch {
    return { name: 'Shortener Validator', detector: 'shortener-parser', category: 'domain', severity: 'info', safe: true, scoreImpact: 0, title: 'Unparseable URL', message: 'Invalid URL.' };
  }

  const isShortener = DEFAULT_SHORTENERS.has(hostname) || customShorteners.includes(hostname);

  if (isShortener) {
    return {
      name: 'Shortener Validator',
      detector: 'shortener-detected',
      category: 'domain',
      severity: 'medium',
      title: 'URL Shortener Detected',
      safe: false, // We flag it as unsafe/warning so it impacts score or user is warned
      scoreImpact: 10,
      message: `Warning: URL uses a shortening service (${hostname}). It will be expanded.`,
      metadata: { isShortener: true },
    };
  }

  return {
    name: 'Shortener Validator',
    detector: 'shortener-clean',
    category: 'domain',
    severity: 'info',
    title: 'No Shortener Detected',
    safe: true,
    scoreImpact: 0,
    message: 'URL does not appear to be a known shortening service.',
    metadata: { isShortener: false },
  };
}
