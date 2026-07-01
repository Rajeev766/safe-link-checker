/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PluginContext, VerificationPlugin } from '../core/plugin.js';
import type { CheckResult, DecisionAction } from '@safe-link-checker/types';

export interface DeclarativeRule {
  id: string;
  condition: {
    all?: string[];
    any?: string[];
    none?: string[];
    hasCategory?: string[];
  };
  action: DecisionAction;
  message: string;
}

export class RuleEnginePlugin implements VerificationPlugin {
  id = 'core:rule-engine';
  name = 'RuleEngine';
  version = '2.0.0';
  description = 'Executes declarative logic rules';
  author = 'SafeLink Team';
  type: 'heuristic' = 'heuristic';
  capabilities = ['custom-rules', 'policy-enforcement'];
  priority = 10;
  weight = 1.0;
  
  private rules: DeclarativeRule[] = [];

  constructor() {
    this.registerBuiltIns();
  }

  private registerBuiltIns() {
    this.rules.push({
      id: 'high-risk-combo',
      condition: {
        all: ['homograph', 'url_shortener']
      },
      action: 'BLOCK',
      message: 'Suspicious combination of URL shortener and homograph characters'
    });

    this.rules.push({
      id: 'private-ip-block',
      condition: {
        all: ['private_ip']
      },
      action: 'BLOCK',
      message: 'Internal/Private IPs are strictly forbidden'
    });
  }

  loadRules(rules: DeclarativeRule[]) {
    this.rules.push(...rules);
  }

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const checks = (ctx.state.checks as CheckResult[]) || [];
    const evidenceNames = new Set(checks.map(c => c.name.toLowerCase().replace(/ /g, '_')));
    const evidenceCategories = new Set<string>(checks.flatMap(c => c.category != null ? [c.category as string] : []));

    for (const rule of this.rules) {
      let matches = true;
      const cond = rule.condition;

      if (cond.all && cond.all.some(c => !evidenceNames.has(c.toLowerCase()))) matches = false;
      if (cond.any && !cond.any.some(c => evidenceNames.has(c.toLowerCase()))) matches = false;
      if (cond.none && cond.none.some(c => evidenceNames.has(c.toLowerCase()))) matches = false;
      if (cond.hasCategory && !cond.hasCategory.some(c => evidenceCategories.has(c))) matches = false;

      if (matches && (cond.all || cond.any || cond.none || cond.hasCategory)) {
        return {
          name: `Rule: ${rule.id}`,
          detector: 'rule-engine',
          category: 'behavior',
          severity: rule.action === 'BLOCK' ? 'high' : 'medium',
          safe: rule.action !== 'BLOCK',
          scoreImpact: rule.action === 'BLOCK' ? 30 : 10,
          confidence: 1,
          message: rule.message,
          fatal: rule.action === 'BLOCK'
        };
      }
    }
    return null;
  }
}
