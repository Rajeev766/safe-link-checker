import type { CheckResult, RiskLevel, Classification, ThreatLevel } from '@safe-link-checker/types';
import { EvidenceEngine } from './evidence.js';

export interface ReputationResult {
  trustScore: number;
  riskScore: number;
  confidence: number;
  classification: Classification;
  threatLevel: ThreatLevel;
  riskLevel: RiskLevel; // Legacy mapped
  safe: boolean;
  summary: string;
  recommendation: string;
  evidence: CheckResult[];
  categories: Record<string, number>;
}

export class ReputationEngine {
  
  evaluate(rawChecks: (CheckResult | null)[]): ReputationResult {
    const evidence = EvidenceEngine.process(rawChecks);
    const categories = EvidenceEngine.categorize(evidence);
    
    let riskScore = 0;
    let accumulatedConfidence = 0;
    let totalWeight = 0;
    
    let hasCritical = false;
    let hasHigh = false;
    let hasMalware = false;
    let hasPhishing = false;

    if (evidence.length === 0) {
      return {
        trustScore: 100,
        riskScore: 0,
        confidence: 0,
        classification: 'Unknown',
        threatLevel: 'UNKNOWN',
        riskLevel: 'SAFE',
        safe: true,
        summary: 'No verification data available.',
        recommendation: 'Proceed with standard caution.',
        evidence: [],
        categories: {}
      };
    }

    for (const res of evidence) {
      const weight = res.weight ?? 1.0;
      let conf = res.confidence !== undefined ? res.confidence : 100;
      if (conf <= 1 && conf > 0) conf = conf * 100; // Normalize
      
      const impact = res.scoreContribution ?? res.scoreImpact ?? 0;
      
      const adjustedRisk = impact * weight * (conf / 100);
      riskScore += adjustedRisk;
      
      accumulatedConfidence += (conf * weight);
      totalWeight += weight;

      if (res.severity === 'critical' || res.fatal) hasCritical = true;
      if (res.severity === 'high') hasHigh = true;
      
      const desc = (res.description || res.message || '').toLowerCase();
      const title = (res.title || res.name || '').toLowerCase();
      if (desc.includes('malware') || title.includes('malware')) hasMalware = true;
      if (desc.includes('phishing') || title.includes('phishing')) hasPhishing = true;
    }

    // Bound scores
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    const trustScore = 100 - riskScore;
    
    const confidence = totalWeight > 0 ? Math.round(accumulatedConfidence / totalWeight) : 0;

    let threatLevel: ThreatLevel = 'LOW';
    let riskLevel: RiskLevel = 'SAFE';
    let classification: Classification = 'Safe';
    
    if (riskScore > 75 || hasCritical) {
      threatLevel = 'CRITICAL';
      riskLevel = 'DANGEROUS';
      classification = hasMalware ? 'Malware' : hasPhishing ? 'Phishing' : 'Unsafe';
    } else if (riskScore > 50 || hasHigh) {
      threatLevel = 'HIGH';
      riskLevel = 'DANGEROUS';
      classification = 'Suspicious';
    } else if (riskScore > 25) {
      threatLevel = 'MEDIUM';
      riskLevel = 'SUSPICIOUS';
      classification = 'Suspicious';
    } else if (riskScore > 0) {
      threatLevel = 'LOW';
      riskLevel = 'SAFE';
      classification = 'Safe';
    }

    let summary = 'This website appears to be safe.';
    let recommendation = 'You can safely proceed to this link.';
    
    if (threatLevel === 'CRITICAL') {
      summary = 'Critical threats detected on this website.';
      recommendation = 'Do not visit this website. It poses a severe security risk.';
    } else if (threatLevel === 'HIGH') {
      summary = 'High risk elements detected.';
      recommendation = 'Avoid interacting with this website or submitting any information.';
    } else if (threatLevel === 'MEDIUM') {
      summary = 'This website has some suspicious characteristics.';
      recommendation = 'Proceed with caution and verify the domain name.';
    }

    return {
      trustScore,
      riskScore,
      confidence,
      classification,
      threatLevel,
      riskLevel,
      safe: threatLevel === 'LOW',
      summary,
      recommendation,
      evidence,
      categories
    };
  }
}
