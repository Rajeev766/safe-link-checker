/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defaultCache } from './cache/memory.js';
import { LRUCache } from './cache/lru.js';
import { extractMetadata, type MetadataResult } from './utils/metadata.js';
import { URLHausProvider } from './providers/urlhaus.js';
import { OpenPhishProvider } from './providers/openphish.js';
import { EventEmitter } from './core/events.js';
import { PluginManager } from './core/plugin.js';
import type { PluginContext, VerificationPlugin } from './core/plugin.js';
import { ConsensusEngine } from './engine/consensus.js';
import { PolicyEngine } from './engine/policy.js';
import { RuleEnginePlugin } from './engine/rules.js';
import { ProviderPluginAdapter } from './plugins/core/provider.js';
import { DefaultPluginFactory } from './core/factory.js';
import { normalizeLink } from './utils/normalize.js';
import type { Provider, VerifyOptions, VerificationResult, CheckResult } from './types/index.js';

export interface CheckerOptions extends VerifyOptions {
  mode?: 'local' | 'cloud';
  apiKey?: string;
  endpoint?: string;
  cache?: boolean | {
    get(url: string): VerificationResult | null;
    set(url: string, result: VerificationResult): void;
  };
  providers?: (Provider | 'openphish' | 'urlhaus')[];
  onStart?: (url: string) => void;
  onComplete?: (result: VerificationResult) => void;
  onError?: (error: Error, url: string) => void;
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

/**
 * The main orchestrator for validating URLs. 
 * Allows configuration of caching, timeouts, concurrent provider plugins, and batch processing.
 */
export class SafeLinkChecker extends EventEmitter {
  private cache: { get(url: string): VerificationResult | null; set(url: string, result: VerificationResult): void } | null = null;
  private metadataCache = new LRUCache<MetadataResult>({ maxSize: 500, ttlMs: 1000 * 60 * 60 });
  private options: CheckerOptions;
  public pluginManager: PluginManager;
  public consensusEngine: ConsensusEngine;
  public policyEngine: PolicyEngine;

  constructor(options: CheckerOptions = {}) {
    super();
    this.options = options;
    this.pluginManager = new PluginManager();
    this.consensusEngine = new ConsensusEngine();
    this.policyEngine = new PolicyEngine();

    if (options.cache === true || options.cache === undefined) {
      this.cache = defaultCache;
    } else if (options.cache !== false) {
      this.cache = options.cache;
    }

    // Register core plugins via the factory
    DefaultPluginFactory.registerCorePlugins(this.pluginManager);
    this.pluginManager.register(new RuleEnginePlugin());

    if (options.providers) {
      for (const p of options.providers) {
        if (p === 'openphish') this.use(new OpenPhishProvider());
        else if (p === 'urlhaus') this.use(new URLHausProvider());
        else this.use(p as Provider);
      }
    }
  }

  /**
   * Adds a legacy Provider or a new VerificationPlugin to the checker.
   */
  use(plugin: Provider | VerificationPlugin): this {
    if ('check' in plugin) {
      this.pluginManager.register(new ProviderPluginAdapter(plugin as Provider));
    } else {
      this.pluginManager.register(plugin as VerificationPlugin);
    }
    return this;
  }

  async getMetadata(url: string): Promise<MetadataResult | null> {
    const cached = this.metadataCache.get(url);
    if (cached) return cached;

    const result = await extractMetadata(url, this.options.timeout);
    if (result) {
      this.metadataCache.set(url, result);
    }
    return result;
  }

  /**
   * Verifies a single URL through the core engine and any registered providers.
   * Caches results if configured.
   * 
   * @param url The URL to check.
   * @param runtimeOptions Options overriding the global checker options for this specific call.
   * @returns A detailed VerificationResult including the final risk score.
   */
  async verify(url: string, runtimeOptions: VerifyOptions = {}): Promise<VerificationResult> {
    const mergedOptions = Object.keys(runtimeOptions).length === 0 
      ? this.options 
      : { ...this.options, ...runtimeOptions };

    try {
      if (!mergedOptions.bypassCache && this.cache) {
        const cached = this.cache.get(url);
        if (cached) {
          const res = { ...cached, fromCache: true };
          if (this.options.onComplete) this.options.onComplete(res);
          return res;
        }
      }

      let baseResult: VerificationResult;
      
      if (mergedOptions.mode === 'cloud') {
        baseResult = await this.verifyCloud(url, mergedOptions);
      } else {
        baseResult = await this.verifyLocal(url, mergedOptions);
      }

      if (!mergedOptions.bypassCache && this.cache) {
        this.cache.set(url, { ...baseResult, fromCache: false });
      }
      this.emit('onComplete', baseResult);
      if (this.options.onComplete) this.options.onComplete(baseResult);
      return baseResult;
    } catch (error: unknown) {
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        throw new TimeoutError(`Verification timed out for ${url}`);
      }
      this.emit('onError', error as Error, url);
      if (this.options.onError) this.options.onError(error as Error, url);
      throw error;
    }
  }

  private async verifyCloud(url: string, mergedOptions: VerifyOptions & CheckerOptions): Promise<VerificationResult> {
    if (!mergedOptions.endpoint) throw new SafeLinkError('Cloud mode requires an endpoint configuration.');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (mergedOptions.apiKey) headers['Authorization'] = `Bearer ${mergedOptions.apiKey}`;

    const response = await fetch(`${mergedOptions.endpoint.replace(/\/$/, '')}/v1/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
      signal: mergedOptions.signal ?? null
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new SafeLinkError(`Cloud API Error: ${response.status} - ${errText}`);
    }

    return await response.json() as VerificationResult;
  }

  private async verifyLocal(url: string, mergedOptions: VerifyOptions & CheckerOptions): Promise<VerificationResult> {
    // Initialize plugins if necessary (idempotent)
    await this.pluginManager.initAll();

    // Emit onStart
    this.emit('onStart', url);
    if (this.options.onStart) this.options.onStart(url);

    const normalizedUrl = normalizeLink(url, mergedOptions);

    // Create Plugin Context
    const ctx: PluginContext = {
      url,
      normalizedUrl,
      options: mergedOptions,
      state: {}
    };

    const checks: CheckResult[] = [];
    const plugins = this.pluginManager.getAll();

    for (const plugin of plugins) {
      try {
        const res = await plugin.execute(ctx);
        if (res) {
          checks.push(res);
          // Extensible short-circuiting: any plugin can flag a fatal issue to abort further checks
          if (res.fatal) {
            break;
          }
        }
      } catch (e: unknown) {
        // Log plugin errors but continue
        this.emit('pluginError', plugin.name, e);
      }
    }

    // Consensus Evaluation
    const engineResult = this.consensusEngine.evaluate(checks);
    
    // Policy Evaluation
    const policyCtx = {
      riskLevel: engineResult.riskLevel,
      score: engineResult.score,
      confidence: engineResult.confidence
    };
    const policyResult = this.policyEngine.evaluate(mergedOptions.policy, policyCtx);

    return {
      // Legacy
      url,
      normalizedUrl,
      safe: engineResult.safe,
      score: engineResult.score,
      confidence: engineResult.confidence,
      riskLevel: engineResult.riskLevel,
      reasons: engineResult.reasons,
      recommendations: [], // Can be generated by an AI plugin later
      redirectChain: ctx.state.redirectTrace?.chain || [],
      redirectTrace: ctx.state.redirectTrace || { chain: [], finalUrl: normalizedUrl, redirectCount: 0, anomalies: [] },
      checks,
      fromCache: false,
      
      // XTI
      trustScore: engineResult.trustScore,
      summary: engineResult.summary,
      decision: policyResult.decision,
      action: policyResult.action,
      policy: mergedOptions.policy || 'balanced',
      evidence: checks, // evidence is heavily structured CheckResult[]
    };
  }

  /**
   * Concurrently verifies multiple URLs with a bounded concurrency limit.
   * Results are returned in the exact same order as the input array.
   *
   * @param urls Array of URLs to verify.
   * @param runtimeOptions Options overriding the global checker options.
   * @param concurrency The maximum number of concurrent verifications (defaults to 5).
   * @returns Array of VerificationResult corresponding to the input URLs.
   */
  async verifyLinks(urls: string[], runtimeOptions: VerifyOptions = {}, concurrency = 5): Promise<VerificationResult[]> {
    const mergedOptions = Object.keys(runtimeOptions).length === 0 
      ? this.options 
      : { ...this.options, ...runtimeOptions };

    // Fast path: bulk request to Cloud API
    if (mergedOptions.mode === 'cloud') {
      if (!mergedOptions.endpoint) throw new SafeLinkError('Cloud mode requires an endpoint configuration.');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (mergedOptions.apiKey) headers['Authorization'] = `Bearer ${mergedOptions.apiKey}`;

      const response = await fetch(`${mergedOptions.endpoint.replace(/\/$/, '')}/v1/verify/batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ urls }),
        signal: mergedOptions.signal ?? null
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Unknown error');
        throw new SafeLinkError(`Cloud API Error: ${response.status} - ${errText}`);
      }

      const results = await response.json() as VerificationResult[];
      return results;
    }

    const results: VerificationResult[] = new Array(urls.length);
    let index = 0;

    const worker = async () => {
      while (index < urls.length) {
        const currentIndex = index++;
        const url = urls[currentIndex] as string;
        results[currentIndex] = await this.verify(url, runtimeOptions);
      }
    };

    const workers = Array(Math.min(concurrency, urls.length)).fill(null).map(() => worker());
    await Promise.all(workers);

    return results;
  }
}
