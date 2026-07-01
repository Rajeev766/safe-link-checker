/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DecisionAction, RiskLevel } from '../types/index.js';

export interface PolicyContext {
  riskLevel: RiskLevel;
  score: number;
  confidence: number;
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
      if (ctx.riskLevel !== 'SAFE' || ctx.score > 0) {
        return { decision: 'block', action: 'Strict policy blocked any non-zero risk score' };
      }
      return { decision: 'allow', action: 'Strict policy allowed safe URL' };
    });

    this.policies.set('balanced', (ctx) => {
      if (ctx.riskLevel === 'DANGEROUS') {
        return { decision: 'block', action: 'Blocked dangerous URL' };
      }
      if (ctx.riskLevel === 'SUSPICIOUS') {
        return { decision: 'warn', action: 'Display warning screen' };
      }
      return { decision: 'allow', action: 'Allowed safe URL' };
    });

    this.policies.set('enterprise', (ctx) => {
      if (ctx.riskLevel === 'DANGEROUS') {
        return { decision: 'block', action: 'Enterprise policy blocked dangerous URL' };
      }
      if (ctx.score > 20) {
        return { decision: 'review', action: 'Sent to SOC for manual review' };
      }
      if (ctx.riskLevel === 'SUSPICIOUS') {
        return { decision: 'warn', action: 'Warn user before proceeding' };
      }
      return { decision: 'allow', action: 'Enterprise allowed safe URL' };
    });
  }

  register(name: string, policy: PolicyDefinition) {
    this.policies.set(name, policy);
  }

  evaluate(policyName: string | undefined, ctx: PolicyContext): PolicyResult {
    const name = policyName || 'balanced';
    const policy = this.policies.get(name);
    if (!policy) {
      // Fallback to balanced
      return this.policies.get('balanced')!(ctx);
    }
    return policy(ctx);
  }
}
