import type { CheckResult } from '../types/index.js';
import validator from 'validator';

export function validateUrl(urlStr: string): CheckResult {
  const trimmed = urlStr.trim();

  if (!validator.isURL(trimmed, { require_protocol: true })) {
    return {
      name: 'URL Validator',
      safe: false,
      scoreImpact: 100,
      message: 'Malformed URL: Failed syntax validation.',
    };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        name: 'URL Validator',
        safe: false,
        scoreImpact: 100,
        message: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are allowed.`,
      };
    }

    if (!parsed.hostname) {
      return {
        name: 'URL Validator',
        safe: false,
        scoreImpact: 100,
        message: 'Invalid URL: Hostname is missing.',
      };
    }

    return {
      name: 'URL Validator',
      safe: true,
      scoreImpact: 0,
      message: 'URL is valid and protocol is supported.',
    };
  } catch (err: unknown) {
    return {
      name: 'URL Validator',
      safe: false,
      scoreImpact: 100,
      message: `Malformed URL: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}


