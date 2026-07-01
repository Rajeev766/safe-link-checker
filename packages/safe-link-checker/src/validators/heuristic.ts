/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult } from '../types/index.js';
import { parse } from 'tldts';

const SUSPICIOUS_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'zip', 'mov', 'cc', 'ru', 'cn', 'pw', 'top', 'xyz', 'icu', 'wang', 'space', 'work'
]);

const SUSPICIOUS_KEYWORDS = [
  'login', 'admin', 'secure', 'update', 'billing', 'banking', 'verify', 'account', 'password', 'credential', 'auth', 'support', 'service'
];

const HIGH_PROFILE_TARGETS = [
  'google', 'apple', 'facebook', 'microsoft', 'amazon', 'paypal', 'netflix', 'chase', 'bankofamerica', 'linkedin', 'twitter', 'instagram'
];

// Simple Levenshtein distance implementation
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) matrix[i]![0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0]![j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }
  return matrix[a.length]![b.length]!;
}

export function validateHeuristics(url: string): CheckResult {
  const result: CheckResult = {
    name: 'Heuristics Validator',
    detector: 'heuristics-engine',
    category: 'behavior',
    severity: 'info',
    title: 'Heuristics Check Passed',
    safe: true,
    scoreImpact: 0,
    message: '',
    metadata: {
      flags: [] as string[]
    }
  };

  const parsed = parse(url);
  const flags: string[] = [];
  let penalty = 0;

  if (parsed.isIp) {
    // IPs are handled by IP validator, but raw IPs are inherently suspicious for standard phishing
    flags.push('raw_ip');
  }

  // TLD check
  if (parsed.publicSuffix && SUSPICIOUS_TLDS.has(parsed.publicSuffix.toLowerCase())) {
    flags.push('suspicious_tld');
    penalty += 20;
  }

  // Subdomain depth
  if (parsed.subdomain) {
    const depth = parsed.subdomain.split('.').length;
    if (depth >= 3) {
      flags.push('excessive_subdomains');
      penalty += 15;
    }
  }

  // Keyword check
  const lowerUrl = url.toLowerCase();
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (lowerUrl.includes(keyword)) {
      flags.push(`suspicious_keyword:${keyword}`);
      penalty += 10;
    }
  }

  // Obfuscation check
  if (url.includes('@')) {
    flags.push('credential_trick');
    penalty += 30; // @ trick is very suspicious
  }
  
  const encodedCount = (url.match(/%[0-9A-Fa-f]{2}/g) || []).length;
  if (encodedCount > 10) {
    flags.push('excessive_encoding');
    penalty += 15;
  }

  // Lookalike check
  if (parsed.domainWithoutSuffix) {
    const domainName = parsed.domainWithoutSuffix.toLowerCase();
    for (const target of HIGH_PROFILE_TARGETS) {
      if (domainName === target) {
        // Legitimate target
        continue;
      }
      
      const distance = levenshtein(domainName, target);
      // If it's 1 or 2 characters off from a major brand, it's very suspicious
      // Allow some leeway for short domains, but most targets are > 5 chars
      if (distance > 0 && distance <= 2) {
        flags.push(`lookalike_domain:${target}`);
        penalty += 40;
        break;
      }

      // Check regex substitutions (e.g. g00gle)
      const deobfuscated = domainName.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/5/g, 's');
      if (deobfuscated === target && deobfuscated !== domainName) {
        flags.push(`lookalike_domain_substituted:${target}`);
        penalty += 50;
        break;
      }
    }
  }

  if (penalty > 0) {
    result.safe = false;
    result.scoreImpact = Math.min(100, penalty);
    result.metadata!.flags = flags;
    result.title = 'Suspicious Heuristics Detected';
    result.message = `Detected suspicious heuristics: ${flags.join(', ')}`;
    
    if (result.scoreImpact >= 50) {
      result.severity = 'critical';
    } else if (result.scoreImpact >= 30) {
      result.severity = 'high';
    } else {
      result.severity = 'medium';
    }
  }

  return result;
}
