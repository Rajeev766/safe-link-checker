/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { VerificationPlugin, PluginContext, PluginType } from '@safe-link-checker/core';
// traceRedirects will be imported dynamically
import type { CheckResult } from '@safe-link-checker/core';

export class RedirectPlugin implements VerificationPlugin {
  id = 'core:redirect-trace';
  name = 'RedirectTrace';
  version = '1.0.0';
  description = 'Traces URL redirects to final destination';
  author = 'SafeLink Team';
  type: PluginType = 'network';
  capabilities = ['redirect-following', 'chain-analysis'];
  priority = 95;
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    // If the IP is already marked local, tracing might be skipped or handled differently, 
    // but the engine handles short-circuits. We will run it
    try {
      const traceRedirects = ctx.capabilities?.traceRedirects;
      if (!traceRedirects) {
        return null; // Skip if capability is missing
      }

      const trace = await traceRedirects(ctx.normalizedUrl, ctx.options);
      ctx.state.redirectTrace = trace;
      ctx.state.finalUrl = trace.finalUrl;
      
      let scoreImpact = 0;
      let message = `Followed ${trace.redirectCount} redirects.`;
      let safe = true;

      let severity: import('@safe-link-checker/types').RiskSeverity = 'info';

      if (trace.anomalies.includes('LOOP')) {
        scoreImpact += 40;
        message = 'Redirect loop detected.';
        safe = false;
        severity = 'critical';
      }
      if (trace.anomalies.includes('MAX_REDIRECTS_EXCEEDED')) {
        scoreImpact += 20;
        message = 'Maximum redirects exceeded.';
        safe = false;
        severity = severity === 'info' ? 'high' : severity;
      }
      if (trace.anomalies.includes('PROTOCOL_DOWNGRADE')) {
        scoreImpact += 30;
        message = 'Protocol downgrade (HTTPS to HTTP) detected.';
        safe = false;
        severity = severity === 'info' ? 'critical' : severity;
      }

      return {
        name: this.name,
        detector: 'redirect-trace',
        category: 'redirect',
        severity,
        title: 'Redirect Trace Analysis',
        safe,
        scoreImpact,
        message,
        confidence: 95
      };
    } catch (e: unknown) {
      return {
        name: this.name,
        detector: 'redirect-trace',
        category: 'redirect',
        severity: 'medium',
        title: 'Redirect Trace Failure',
        safe: false,
        scoreImpact: 10,
        message: `Redirect trace failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        confidence: 80
      };
    }
  }
}
