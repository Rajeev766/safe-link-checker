/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult, RiskLevel } from '../types/index.js';

export interface ConsensusConfig {
  baseScore: number;
  riskThresholds: {
    suspicious: number;
    dangerous: number;
  };
}

export interface ConsensusResult {
  score: number;
  trustScore: number;
  confidence: number;
  riskLevel: RiskLevel;
  reasons: string[];
  safe: boolean;
  summary: string;
}

export class ConsensusEngine {
  private config: ConsensusConfig;

  constructor(config?: Partial<ConsensusConfig>) {
    this.config = {
      baseScore: 100,
      riskThresholds: {
        suspicious: 75,
        dangerous: 40,
      },
      ...config
    };
  }

  evaluate(results: (CheckResult | null)[]): ConsensusResult {
    let score = this.config.baseScore;
    let accumulatedConfidence = 0;
    let totalWeight = 0;
    const reasons: string[] = [];
    
    // Filter out nulls (skipped checks)
    const validResults = results.filter((r): r is CheckResult => r !== null);

    if (validResults.length === 0) {
      return {
        score: this.config.baseScore,
        trustScore: 100,
        confidence: 0,
        riskLevel: 'SAFE',
        reasons: ['No checks performed'],
        safe: true,
        summary: 'No data available to verify this URL.'
      };
    }

    let hasCritical = false;

    for (const res of validResults) {
      const weight = res.weight ?? 1.0;
      let conf = res.confidence !== undefined ? res.confidence : 100;
      
      // XTI normalization: If confidence is <= 1, it's a 0-1 scale. If > 1, assume legacy 0-100.
      if (conf <= 1 && conf > 0) conf = conf * 100;
      
      // Fallback for missing impact
      const impact = res.scoreContribution ?? res.scoreImpact ?? 0;

      const adjustedPenalty = impact * weight * (conf / 100);
      
      score -= adjustedPenalty;
      accumulatedConfidence += (conf * weight);
      totalWeight += weight;

      if (res.severity === 'critical' || res.fatal) hasCritical = true;

      if (!res.safe || impact > 0 || res.severity === 'high' || res.severity === 'critical') {
        const title = res.title ?? res.name;
        reasons.push(`${title}: ${res.description ?? res.message}`);
      }
    }

    // Bound score
    score = Math.max(0, Math.min(100, Math.round(score)));

    // XTI Trust Score is inverse of penalties, basically the score but cleanly scaled.
    // In the future this can diverge if we add positive trust signals.
    let trustScore = score; 

    // Average confidence across all valid checks based on weight
    const averageConfidence = totalWeight > 0 ? Math.round(accumulatedConfidence / totalWeight) : 0;

    let riskLevel: RiskLevel = 'SAFE';
    if (score <= this.config.riskThresholds.dangerous || hasCritical) {
      riskLevel = 'DANGEROUS';
      trustScore = 0; // Critical faults instantly drop trust to 0
    } else if (score <= this.config.riskThresholds.suspicious) {
      riskLevel = 'SUSPICIOUS';
    }

    let summary = 'This website appears legitimate.';
    if (riskLevel === 'DANGEROUS') {
      summary = 'This website should not be visited. It has been flagged as dangerous.';
    } else if (riskLevel === 'SUSPICIOUS') {
      summary = 'This website contains suspicious elements and should be approached with caution.';
    }

    return {
      score,
      trustScore,
      confidence: averageConfidence,
      riskLevel,
      reasons,
      safe: riskLevel === 'SAFE',
      summary
    };
  }
}
