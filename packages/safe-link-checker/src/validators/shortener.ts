import type { CheckResult } from '../types/index.js';

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
    return { name: 'Shortener Validator', safe: true, scoreImpact: 0, message: 'Invalid URL.' };
  }

  const isShortener = DEFAULT_SHORTENERS.has(hostname) || customShorteners.includes(hostname);

  if (isShortener) {
    return {
      name: 'Shortener Validator',
      safe: false, // We flag it as unsafe/warning so it impacts score or user is warned
      scoreImpact: 10,
      message: `Warning: URL uses a shortening service (${hostname}). It will be expanded.`,
      metadata: { isShortener: true },
    };
  }

  return {
    name: 'Shortener Validator',
    safe: true,
    scoreImpact: 0,
    message: 'URL does not appear to be a known shortening service.',
    metadata: { isShortener: false },
  };
}
