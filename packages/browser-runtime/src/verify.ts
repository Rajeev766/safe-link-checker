import { SafeLinkChecker, type CheckerOptions } from './checker.js';
import type { VerificationResult, VerifyOptions } from '@safe-link-checker/core';

let defaultChecker: SafeLinkChecker | null = null;

export async function verifyLink(url: string, options?: VerifyOptions & CheckerOptions): Promise<VerificationResult> {
  if (!defaultChecker) {
    defaultChecker = new SafeLinkChecker(options);
  } else if (options && Object.keys(options).length > 0) {
    const customChecker = new SafeLinkChecker(options);
    return customChecker.verify(url);
  }
  return defaultChecker.verify(url);
}

export async function verifyLinks(urls: string[], options?: VerifyOptions & CheckerOptions): Promise<VerificationResult[]> {
  if (!defaultChecker) {
    defaultChecker = new SafeLinkChecker(options);
  } else if (options && Object.keys(options).length > 0) {
    const customChecker = new SafeLinkChecker(options);
    return customChecker.verifyLinks(urls);
  }
  return defaultChecker.verifyLinks(urls);
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}
