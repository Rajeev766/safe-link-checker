import type { VerificationPlugin, PluginContext, PluginType } from '../../core/plugin.js';
import { traceRedirects } from '../../validators/redirect.js';
import type { CheckResult } from '../../types/index.js';

export class RedirectPlugin implements VerificationPlugin {
  name = 'RedirectTrace';
  type: PluginType = 'network';
  version = '1.0.0';
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    // If the IP is already marked local, tracing might be skipped or handled differently, 
    // but the engine handles short-circuits. We will run it if allowed.
    try {
      const trace = await traceRedirects(ctx.normalizedUrl, ctx.options);
      ctx.state.set('redirectTrace', trace);
      ctx.state.set('finalUrl', trace.finalUrl);
      
      let scoreImpact = 0;
      let message = `Followed ${trace.redirectCount} redirects.`;
      let safe = true;

      if (trace.anomalies.includes('LOOP')) {
        scoreImpact += 40;
        message = 'Redirect loop detected.';
        safe = false;
      }
      if (trace.anomalies.includes('MAX_REDIRECTS_EXCEEDED')) {
        scoreImpact += 20;
        message = 'Maximum redirects exceeded.';
        safe = false;
      }
      if (trace.anomalies.includes('PROTOCOL_DOWNGRADE')) {
        scoreImpact += 30;
        message = 'Protocol downgrade (HTTPS to HTTP) detected.';
        safe = false;
      }

      return {
        name: this.name,
        safe,
        scoreImpact,
        message,
        confidence: 95
      };
    } catch (e: unknown) {
      return {
        name: this.name,
        safe: false,
        scoreImpact: 10,
        message: `Redirect trace failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        confidence: 80
      };
    }
  }
}
