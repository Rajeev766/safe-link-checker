import type { CheckResult, RiskLevel } from '../types/index.js';

export interface ConsensusConfig {
  baseScore: number;
  riskThresholds: {
    suspicious: number;
    dangerous: number;
  };
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

  evaluate(results: (CheckResult | null)[]): {
    score: number;
    confidence: number;
    riskLevel: RiskLevel;
    reasons: string[];
    safe: boolean;
  } {
    let score = this.config.baseScore;
    let accumulatedConfidence = 0;
    const reasons: string[] = [];
    
    // Filter out nulls (skipped checks)
    const validResults = results.filter((r): r is CheckResult => r !== null);

    if (validResults.length === 0) {
      return {
        score: this.config.baseScore,
        confidence: 0,
        riskLevel: 'SAFE',
        reasons: ['No checks performed'],
        safe: true
      };
    }

    for (const res of validResults) {
      const weight = res.weight ?? 1.0;
      const confidence = res.confidence ?? 100;
      
      // Calculate weighted impact
      // We scale the impact based on confidence of the provider.
      // scoreImpact is traditionally a positive penalty.
      const adjustedPenalty = res.scoreImpact * weight * (confidence / 100);
      
      score -= adjustedPenalty;
      accumulatedConfidence += confidence;

      if (!res.safe || res.scoreImpact > 0) {
        reasons.push(`${res.name}: ${res.message} (Penalty: ${adjustedPenalty.toFixed(1)})`);
      }
    }

    // Bound score
    score = Math.max(0, Math.min(100, score));

    // Average confidence across all valid checks
    const averageConfidence = Math.round(accumulatedConfidence / validResults.length);

    let riskLevel: RiskLevel = 'SAFE';
    if (score <= this.config.riskThresholds.dangerous) {
      riskLevel = 'DANGEROUS';
    } else if (score <= this.config.riskThresholds.suspicious) {
      riskLevel = 'SUSPICIOUS';
    }

    return {
      score: Math.round(score),
      confidence: averageConfidence,
      riskLevel,
      reasons,
      safe: riskLevel === 'SAFE'
    };
  }
}
