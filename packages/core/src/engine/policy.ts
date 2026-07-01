/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DecisionAction, RiskLevel, Classification, ThreatLevel } from '@safe-link-checker/types';

export interface PolicyContext {
  trustScore: number;
  riskScore: number;
  confidence: number;
  classification: Classification;
  threatLevel: ThreatLevel;
  riskLevel: RiskLevel; // Legacy
  score: number; // Legacy
}

export interface PolicyResult {
  decision: DecisionAction;
  action: string;
}

export type PolicyDefinition = (ctx: PolicyContext) => PolicyResult;

export class PolicyEngine {
  private policies: Map<string, PolicyDefinition> = new Map();

  constructor() {
    this.registerBuiltIns();
  }

  private registerBuiltIns() {
    this.policies.set('strict', (ctx) => {
      if (ctx.threatLevel !== 'LOW' || ctx.riskScore > 0) {
        return { decision: 'BLOCK', action: 'Strict policy blocked any non-zero risk' };
      }
      return { decision: 'ALLOW', action: 'Strict policy allowed safe URL' };
    });

    this.policies.set('balanced', (ctx) => {
      if (ctx.threatLevel === 'CRITICAL' || ctx.threatLevel === 'HIGH') {
        return { decision: 'BLOCK', action: 'Blocked dangerous URL' };
      }
      if (ctx.threatLevel === 'MEDIUM') {
        return { decision: 'WARN', action: 'Display warning screen' };
      }
      return { decision: 'ALLOW', action: 'Allowed safe URL' };
    });

    this.policies.set('enterprise', (ctx) => {
      if (ctx.threatLevel === 'CRITICAL') {
        return { decision: 'BLOCK', action: 'Enterprise policy blocked critical risk' };
      }
      if (ctx.riskScore > 20) {
        return { decision: 'ESCALATE', action: 'Sent to SOC for manual review' };
      }
      if (ctx.threatLevel === 'HIGH' || ctx.threatLevel === 'MEDIUM') {
        return { decision: 'WARN', action: 'Warn user before proceeding' };
      }
      return { decision: 'ALLOW', action: 'Enterprise allowed safe URL' };
    });

    this.policies.set('parental', (ctx) => {
      if (ctx.threatLevel !== 'LOW' || ctx.riskScore > 10) {
        return { decision: 'BLOCK', action: 'Parental control blocked unsafe content' };
      }
      return { decision: 'ALLOW', action: 'Parental control allowed safe content' };
    });

    this.policies.set('developer', (ctx) => {
      if (ctx.threatLevel === 'CRITICAL') {
        return { decision: 'WARN', action: 'Developer override: CRITICAL URL bypassed' };
      }
      return { decision: 'ALLOW', action: 'Developer policy allowed all URLs' };
    });

    this.policies.set('messaging', (ctx) => {
      if (ctx.threatLevel === 'CRITICAL' || ctx.threatLevel === 'HIGH') {
        return { decision: 'BLOCK', action: 'Messaging blocked malicious link before sending' };
      }
      if (ctx.threatLevel === 'MEDIUM') {
        return { decision: 'WARN', action: 'Messaging flagged suspicious link' };
      }
      return { decision: 'ALLOW', action: 'Messaging allowed safe link' };
    });

    this.policies.set('social', (ctx) => {
      if (ctx.threatLevel === 'CRITICAL' || ctx.threatLevel === 'HIGH') {
        return { decision: 'BLOCK', action: 'Social platform blocked harmful link' };
      }
      if (ctx.riskScore > 30) {
        return { decision: 'WARN', action: 'Social platform added warning interstitial' };
      }
      return { decision: 'ALLOW', action: 'Social platform allowed safe link' };
    });

    this.policies.set('financial', (ctx) => {
      if (ctx.classification === 'Phishing' || ctx.threatLevel === 'CRITICAL' || ctx.threatLevel === 'HIGH') {
        return { decision: 'BLOCK', action: 'Financial policy strictly blocks all threats' };
      }
      if (ctx.trustScore < 80) {
        return { decision: 'ESCALATE', action: 'Fraud team review required' };
      }
      return { decision: 'ALLOW', action: 'Financial policy allowed verified safe link' };
    });

    this.policies.set('healthcare', (ctx) => {
      if (ctx.threatLevel !== 'LOW' || ctx.riskScore > 15) {
        return { decision: 'BLOCK', action: 'Healthcare HIPAA compliance blocked unsafe link' };
      }
      return { decision: 'ALLOW', action: 'Healthcare policy allowed safe link' };
    });

    this.policies.set('government', (ctx) => {
      if (ctx.threatLevel === 'CRITICAL' || ctx.threatLevel === 'HIGH') {
        return { decision: 'BLOCK', action: 'Government policy blocked high-threat link' };
      }
      if (ctx.threatLevel === 'MEDIUM' || ctx.trustScore < 90) {
        return { decision: 'ESCALATE', action: 'Escalated to Cyber Command' };
      }
      return { decision: 'ALLOW', action: 'Government policy allowed safe link' };
    });
  }

  register(name: string, policy: PolicyDefinition) {
    this.policies.set(name, policy);
  }

  evaluate(policyName: string | undefined, ctx: PolicyContext): PolicyResult {
    const name = policyName || 'balanced';
    const policy = this.policies.get(name);
    if (!policy) {
      return this.policies.get('balanced')!(ctx);
    }
    return policy(ctx);
  }
}
