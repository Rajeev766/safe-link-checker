import { SafeLinkChecker as BrowserChecker, type CheckerOptions as BrowserOptions } from '@safe-link-checker/browser-runtime';
import type { Provider, VerificationResult, VerificationPlugin, PluginType } from '@safe-link-checker/core';
import { URLHausProvider } from '@safe-link-checker/providers';
import { OpenPhishProvider } from '@safe-link-checker/providers';
import { ProviderPluginAdapter } from '@safe-link-checker/plugins';
import { RedirectPlugin } from '@safe-link-checker/plugins';
import { extractMetadata, type MetadataResult } from './utils/metadata.js';
import { LRUCache, type PluginContext, type CheckResult } from '@safe-link-checker/core';
import { validateHttps } from './validators/https.js';

export interface CheckerOptions extends BrowserOptions {
  providers?: (Provider | 'openphish' | 'urlhaus')[];
}

export class SafeLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafeLinkError';
  }
}

export class TimeoutError extends SafeLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class HttpsValidationPlugin implements VerificationPlugin {
  id = 'node:https-validation';
  name = 'HttpsValidation';
  version = '1.0.0';
  description = 'Validates HTTPS certificate and connection';
  author = 'SafeLink Team';
  type: PluginType = 'network';
  capabilities = ['tls-check', 'certificate-validation'];
  priority = 80;
  weight = 1.0;
  readonly runtime = 'node' as const;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    if (ctx.options.checkHttps === false) {
      return null;
    }
    const timeout = ctx.options.timeout ?? 5000;
    const res = await validateHttps(ctx.normalizedUrl, timeout, ctx.options.signal);
    return { ...res, confidence: 95 };
  }
}

import { traceRedirects } from './validators/redirect.js';

export class SafeLinkChecker extends BrowserChecker {
  private metadataCache = new LRUCache<MetadataResult>({ maxSize: 500, ttlMs: 1000 * 60 * 60 });
  
  constructor(options: CheckerOptions = {}) {
    super(options);
    
    // Inject node-specific capabilities for universal plugins
    this.capabilities.traceRedirects = traceRedirects;

    // Register node-specific core plugins (both satisfy VerificationPlugin interface)
    this.pluginManager.register(new HttpsValidationPlugin());
    this.pluginManager.register(new RedirectPlugin());

    if (options.providers) {
      for (const p of options.providers) {
        if (p === 'openphish') this.use(new OpenPhishProvider());
        else if (p === 'urlhaus') this.use(new URLHausProvider());
        else this.use(p as Provider);
      }
    }
  }

  use(plugin: VerificationPlugin | Provider): this {
    if (plugin && typeof plugin === 'object' && 'check' in plugin) {
      this.pluginManager.register(new ProviderPluginAdapter(plugin as Provider));
    } else {
      this.pluginManager.register(plugin as VerificationPlugin);
    }
    return this;
  }

  async getMetadata(url: string, timeout?: number): Promise<MetadataResult | null> {
    const cached = this.metadataCache.get(url);
    if (cached) return cached;

    const result = await extractMetadata(url, timeout);
    if (result) {
      this.metadataCache.set(url, result);
    }
    return result;
  }
}
