/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { VerificationPlugin, PluginContext, PluginType } from '@safe-link-checker/core';
import type { CheckResult, Provider } from '@safe-link-checker/core';

export class ProviderPluginAdapter implements VerificationPlugin {
  type: PluginType = 'provider';
  version = '1.0.0';
  description = 'External threat intelligence provider adapter';
  author = 'SafeLink Team';
  capabilities = ['threat-intelligence'];
  priority = 50;
  weight = 1.0;

  constructor(private provider: Provider) {}

  get id(): string {
    return `provider:${this.provider.name.toLowerCase()}`;
  }

  get name(): string {
    return this.provider.name;
  }

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const urlToTest = ctx.state.finalUrl || ctx.normalizedUrl;
    const res = await this.provider.check(urlToTest, ctx.options);
    if (!res) return null;
    
    // Providers that return malicious get high confidence
    return { ...res, confidence: res.safe ? 80 : 100 };
  }
}
