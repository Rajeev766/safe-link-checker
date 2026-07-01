/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PluginContext, VerificationPlugin } from '../core/plugin.js';
import type { CheckResult } from '../types/index.js';

export type RuleDefinition = (ctx: PluginContext) => Promise<CheckResult | null> | CheckResult | null;

export class RuleEnginePlugin implements VerificationPlugin {
  name = 'RuleEngine';
  private rules: Map<string, RuleDefinition> = new Map();

  constructor() {
    this.registerBuiltIns();
  }

  private registerBuiltIns() {
    this.rules.set('require-https', (ctx) => {
      // Just an example rule that can be toggled via ctx.options
      if (ctx.url.startsWith('http://') && ctx.options.checkHttps !== false) {
        return {
          name: 'Rule: require-https',
          detector: 'rule-engine',
          category: 'network',
          severity: 'high',
          safe: false,
          scoreImpact: 20,
          confidence: 1,
          message: 'HTTP is not allowed by policy',
          fatal: false
        };
      }
      return null;
    });
  }

  register(name: string, rule: RuleDefinition) {
    this.rules.set(name, rule);
  }

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    for (const [name, rule] of this.rules) {
      try {
        const res = await rule(ctx);
        if (res) {
          // Break on first matching rule, or collect all? 
          // For now, return the first rule violation we find, or modify to aggregate later
          return res;
        }
      } catch (e) {
        // ignore rule errors
      }
    }
    return null;
  }
}
