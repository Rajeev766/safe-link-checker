import type { VerificationPlugin, PluginContext, PluginType } from '../../core/plugin.js';
import type { CheckResult, Provider } from '../../types/index.js';

export class ProviderPluginAdapter implements VerificationPlugin {
  type: PluginType = 'provider';
  version = '1.0.0';
  weight = 1.0;

  constructor(private provider: Provider) {}

  get name(): string {
    return this.provider.name;
  }

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const urlToTest = ctx.state.get('finalUrl') || ctx.normalizedUrl;
    const res = await this.provider.check(urlToTest, ctx.options);
    if (!res) return null;
    
    // Providers that return malicious get high confidence
    return { ...res, confidence: res.safe ? 80 : 100 };
  }
}
