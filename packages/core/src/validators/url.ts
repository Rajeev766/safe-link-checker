/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult } from '@safe-link-checker/types';
import isURL from 'validator/lib/isURL.js';
import type Validator from 'validator';

export function validateUrl(urlStr: string): CheckResult {
  const trimmed = urlStr.trim();
  const checkURL = isURL as unknown as typeof Validator.isURL;

  if (!checkURL(trimmed, { require_protocol: true })) {
    return {
      name: 'URL Validator',
      detector: 'url-syntax',
      category: 'domain',
      severity: 'critical',
      safe: false,
      scoreImpact: 100,
      title: 'Malformed URL Syntax',
      message: 'Malformed URL: Failed syntax validation.',
      fatal: true,
    };
  }

  // Prevent HTTP Request Smuggling via parser inconsistencies
  if (/[\r\n\t]/.test(trimmed)) {
    return {
      name: 'URL Validator',
      detector: 'url-smuggling',
      category: 'network',
      severity: 'critical',
      safe: false,
      scoreImpact: 100,
      title: 'HTTP Smuggling Attempt',
      message: 'Malformed URL: Contains illegal characters (CR, LF, or Tab).',
      fatal: true,
    };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        name: 'URL Validator',
        detector: 'url-protocol',
        category: 'network',
        severity: 'high',
        safe: false,
        scoreImpact: 100,
        title: 'Unsupported Protocol',
        message: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are allowed.`,
        fatal: true,
      };
    }

    if (!parsed.hostname) {
      return {
        name: 'URL Validator',
        detector: 'url-hostname',
        category: 'domain',
        severity: 'critical',
        safe: false,
        scoreImpact: 100,
        title: 'Missing Hostname',
        message: 'Invalid URL: Hostname is missing.',
        fatal: true,
      };
    }

    return {
      name: 'URL Validator',
      detector: 'url-validator',
      category: 'domain',
      severity: 'info',
      safe: true,
      scoreImpact: 0,
      title: 'Valid URL',
      message: 'URL is valid and protocol is supported.',
    };
  } catch (err: unknown) {
    return {
      name: 'URL Validator',
      detector: 'url-parser',
      category: 'domain',
      severity: 'critical',
      safe: false,
      scoreImpact: 100,
      title: 'Parser Error',
      message: `Malformed URL: ${err instanceof Error ? err.message : String(err)}`,
      fatal: true,
    };
  }
}


