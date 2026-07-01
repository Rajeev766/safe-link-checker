/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RiskLevel, CheckResult } from '@safe-link-checker/types';

export function calculateScore(validators: CheckResult[]): {
  score: number;
  riskLevel: RiskLevel;
  safe: boolean;
  reasons: string[];
  recommendations: string[];
} {
  let totalPenalty = 0;
  let safe = true;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  for (const v of validators) {
    if (!v.safe) {
      safe = false;
      if (v.message) {
        reasons.push(`[${v.name}] ${v.message}`);
      }

      // Generate standard recommendations based on the validator that flagged the URL
      switch (v.name) {
        case 'IP Validator':
          recommendations.push('Avoid interacting with URLs that resolve to private or local network addresses.');
          break;
        case 'Punycode Validator':
          recommendations.push('Be cautious of potential homograph attacks; visually inspect the domain name.');
          break;
        case 'HTTPS Validator':
          recommendations.push('Prefer links that use secure HTTPS connections to protect your data.');
          break;
        case 'Shortener Validator':
          recommendations.push('URL shorteners can mask malicious destinations; verify the expanded URL before trusting it.');
          break;
        case 'Heuristics Validator':
          recommendations.push('The URL contains suspicious patterns, excessive subdomains, or lookalike domain traits; verify the source carefully.');
          break;
        case 'URL Validator':
          recommendations.push('Ensure the URL is correctly formatted and uses a supported protocol (http/https).');
          break;
      }
    }

    // Apply weighted scoring. Default weight is 1 if not specified by the validator.
    const weight = v.weight ?? 1;
    totalPenalty += v.scoreImpact * weight;
  }

  // Calculate final score based on a starting score of 100 minus the weighted penalty sum
  let score = 100 - totalPenalty;
  if (score < 0) {
    score = 0;
  } else if (score > 100) {
    score = 100;
  }

  let riskLevel: RiskLevel = 'SAFE';
  if (score <= 49) {
    riskLevel = 'DANGEROUS';
  } else if (score <= 89) {
    riskLevel = 'SUSPICIOUS';
  }

  return {
    score,
    riskLevel,
    safe,
    reasons,
    recommendations: [...new Set(recommendations)],
  };
}
