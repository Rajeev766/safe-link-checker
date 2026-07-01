import { 
  defaultCache, 
  EventEmitter, 
  PluginManager,
  ReputationEngine,
  PolicyEngine,
  RuleEnginePlugin,
  DefaultPluginFactory,
  normalizeLink,
  AnalyticsTracker,
  RealtimeSubscriptionEngine,
  CloudGateway
} from '@safe-link-checker/core';
import type { 
  PluginContext, 
  VerificationPlugin,
  VerifyOptions,
  VerificationResult,
  CheckResult,
  PickledResult,
  Classification
} from '@safe-link-checker/core';
import { createSecurityReport, injectReportHelpers } from '@safe-link-checker/core';
import type { ReportData } from '@safe-link-checker/core';

export interface CheckerOptions extends VerifyOptions {
  mode?: 'local' | 'cloud';
  apiKey?: string;
  endpoint?: string;
  cache?: boolean | {
    get(url: string): VerificationResult | null;
    set(url: string, result: VerificationResult): void;
  };
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

export class SafeLinkChecker extends EventEmitter {
  private cache: { get(url: string): VerificationResult | null; set(url: string, result: VerificationResult): void } | null = null;
  private options: CheckerOptions;
  public pluginManager: PluginManager;
  public reputationEngine: ReputationEngine;
  public policyEngine: PolicyEngine;
  public analytics: AnalyticsTracker;
  public realtime: RealtimeSubscriptionEngine;
  public cloudGateway: CloudGateway | null = null;
  public capabilities: Record<string, any> = {};

  constructor(options: CheckerOptions = {}) {
    super();
    this.options = options;
    this.pluginManager = new PluginManager();
    this.reputationEngine = new ReputationEngine();
    this.policyEngine = new PolicyEngine();
    this.analytics = new AnalyticsTracker();
    this.realtime = new RealtimeSubscriptionEngine((url: string) => this.verify(url, { realtime: true }));

    if (options.cloud?.enabled && options.cloud.apiKey) {
      this.cloudGateway = new CloudGateway(options.cloud);
      this.cloudGateway.connect((rules) => {
        // Handle incoming rules from cloud sync
      });
    }

    if (options.cache === true || options.cache === undefined) {
      this.cache = defaultCache;
    } else if (options.cache !== false) {
      this.cache = options.cache;
    }

    // Register core plugins via the factory
    DefaultPluginFactory.registerCorePlugins(this.pluginManager);
    this.pluginManager.register(new RuleEnginePlugin());
  }

  use(plugin: VerificationPlugin): this {
    this.pluginManager.register(plugin);
    return this;
  }

  async verify(url: string, runtimeOptions: VerifyOptions = {}): Promise<VerificationResult> {
    const mergedOptions = Object.keys(runtimeOptions).length === 0 
      ? this.options 
      : { ...this.options, ...runtimeOptions };

    try {
      if (!mergedOptions.bypassCache && this.cache) {
        const cached = this.cache.get(url);
        if (cached) {
          const res = injectReportHelpers({ ...cached, fromCache: true });
          if (this.options.onComplete) this.options.onComplete(res);
          return res;
        }
      }

      let baseResult: VerificationResult;
      
      if (mergedOptions.cloud?.enabled && this.cloudGateway) {
        try {
          baseResult = await this.cloudGateway.verifyCloud(url, mergedOptions.signal);
        } catch (cloudError) {
          // Graceful fallback to local engine if cloud is offline
          this.emit('offlineFallback', url, cloudError);
          baseResult = await this.verifyLocal(url, mergedOptions);
        }
      } else if (mergedOptions.mode === 'cloud') { // Legacy support
        try {
          baseResult = await this.verifyCloudLegacy(url, mergedOptions);
        } catch (e) {
          baseResult = await this.verifyLocal(url, mergedOptions);
        }
      } else {
        baseResult = await this.verifyLocal(url, mergedOptions);
      }

      if (!mergedOptions.bypassCache && this.cache) {
        this.cache.set(url, injectReportHelpers({ ...baseResult, fromCache: false }));
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

  private async verifyCloudLegacy(url: string, mergedOptions: VerifyOptions & CheckerOptions): Promise<VerificationResult> {
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
    const startTime = Date.now();
    await this.pluginManager.initializeAll();

    this.emit('onStart', url);
    if (this.options.onStart) this.options.onStart(url);

    const normalizedUrl = normalizeLink(url, mergedOptions);

    const ctx: PluginContext = {
      url,
      normalizedUrl,
      options: mergedOptions,
      state: {},
      capabilities: this.capabilities
    };

    const checks: CheckResult[] = [];
    const plugins = this.pluginManager.getAll();

    // Declare runtime environment types locally to avoid global namespace pollution
    interface DenoEnv { Deno?: unknown; }
    interface BunEnv { Bun?: unknown; }
    
    const isDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
    const isBun = typeof globalThis !== 'undefined' && 'Bun' in globalThis;
    const isNode = typeof process !== 'undefined' && !!process.versions?.node;
    const isNodeLike = isNode || isBun || isDeno;

    for (const plugin of plugins) {
      if (plugin.runtime === 'node' && !isNodeLike) continue;

      try {
        const res = await plugin.execute(ctx);
        if (res) {
          checks.push(res);
          if (res.fatal) {
            break;
          }
        }
      } catch (e: unknown) {
        this.emit('pluginError', plugin.name, e);
      }
    }

    const engineResult = this.reputationEngine.evaluate(checks);
    
    const policyCtx = {
      trustScore: engineResult.trustScore,
      riskScore: engineResult.riskScore,
      confidence: engineResult.confidence,
      classification: engineResult.classification,
      threatLevel: engineResult.threatLevel,
      riskLevel: engineResult.riskLevel,
      score: 100 - engineResult.trustScore
    };
    const policyResult = this.policyEngine.evaluate(mergedOptions.policy, policyCtx);

    const runtime = isDeno ? 'deno' :
               isBun ? 'bun' :
               typeof process !== 'undefined' && !!process.versions?.electron ? 'electron' :
               typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ? 'react-native' :
               isNode ? 'node' : 'browser';

    const endTime = Date.now();

    const reportData: ReportData = {
      url,
      normalizedUrl,
      safe: engineResult.safe,
      decision: policyResult.decision,
      classification: engineResult.classification,
      trustScore: engineResult.trustScore,
      riskScore: engineResult.riskScore,
      confidence: engineResult.confidence,
      threatLevel: engineResult.threatLevel,
      summary: engineResult.summary,
      recommendation: engineResult.recommendation,
      runtime,
      checks,
      fromCache: false,
      policy: mergedOptions.policy || 'balanced',
      startTime,
      endTime,
      pluginsExecuted: checks.length,
      pluginsSkipped: plugins.filter(p => p.runtime === 'node' && !isNodeLike).length,
      performedCapabilities: plugins.filter(p => p.runtime !== 'node' || isNodeLike).map(p => p.name),
      skippedCapabilities: plugins.filter(p => p.runtime === 'node' && !isNodeLike).map(p => p.name)
    };
    if (ctx.state.redirectTrace) reportData.redirectTrace = ctx.state.redirectTrace;
    if (mergedOptions.debug) reportData.debug = mergedOptions.debug;


    const finalResult = createSecurityReport(reportData);

    if (!mergedOptions.realtime) {
      this.analytics.track({
        url,
        durationMs: 0,
        cacheHit: false,
        providersUsed: finalResult.evidence.filter(c => c.category === 'provider').map(p => p.title),
        rulesTriggered: checks.filter(c => c.detector === 'rule-engine').map(c => c.name),
        threatLevel: engineResult.threatLevel,
        blocked: finalResult.decision.toLowerCase() === 'block'
      });
    }

    if (mergedOptions.telemetry?.enabled && this.cloudGateway) {
      this.cloudGateway.submitTelemetry(finalResult).catch(() => {});
    }

    return finalResult;
  }

  async verifyPickled(url: string, runtimeOptions: VerifyOptions = {}): Promise<PickledResult> {
    const res = await this.verify(url, runtimeOptions);
    return {
      url: res.url.original,
      safe: res.safe,
      decision: res.decision,
      trustScore: res.trustScore,
      riskScore: res.riskScore,
      classification: res.classification as Classification,
      threatLevel: res.threat.level as any,
      securityBadge: res.badge.label,
      riskColor: res.badge.color,
      summary: res.summary,
      recommendation: res.recommendation
    };
  }

  async verifyLinks(urls: string[], runtimeOptions: VerifyOptions = {}, concurrency = 5): Promise<VerificationResult[]> {
    const mergedOptions = Object.keys(runtimeOptions).length === 0 
      ? this.options 
      : { ...this.options, ...runtimeOptions };

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

      return await response.json() as VerificationResult[];
    }

    const results: VerificationResult[] = new Array(urls.length);
    let index = 0;
    
    // Internal scheduler with backpressure and AbortSignal support
    const worker = async () => {
      while (index < urls.length) {
        if (mergedOptions.signal?.aborted) {
          throw new SafeLinkError('Bulk verification aborted');
        }
        
        const currentIndex = index++;
        const url = urls[currentIndex] as string;
        try {
          results[currentIndex] = await this.verify(url, runtimeOptions);
        } catch (e: any) {
          // In bulk processing, individual failures should not crash the batch unless aborted
          if (e.name === 'SafeLinkError' && e.message === 'Bulk verification aborted') throw e;
          
          const fallbackData: ReportData = {
            url,
            normalizedUrl: url,
            safe: false,
            decision: 'block',
            classification: 'unknown',
            trustScore: 0,
            riskScore: 100,
            confidence: 0,
            threatLevel: 'UNKNOWN',
            summary: `Verification failed: ${e.message}`,
            recommendation: 'Retry verification',
            runtime: 'unknown',
            checks: [],
            redirectTrace: { chain: [], finalUrl: url, redirectCount: 0, anomalies: [] },
            fromCache: false,
            policy: mergedOptions.policy || 'balanced',
            startTime: Date.now(),
            endTime: Date.now(),
            pluginsExecuted: 0,
            pluginsSkipped: 0,
            performedCapabilities: [],
            skippedCapabilities: []
          };
          if (mergedOptions.debug) fallbackData.debug = mergedOptions.debug;
          results[currentIndex] = createSecurityReport(fallbackData);

        }
      }
    };

    const effectiveConcurrency = Math.max(1, Math.min(concurrency, urls.length, 50)); // cap at 50 to prevent starvation
    const workers = Array(effectiveConcurrency).fill(null).map(() => worker());
    
    await Promise.all(workers);

    return results;
  }

  async verifyLinksPickled(urls: string[], runtimeOptions: VerifyOptions = {}, concurrency = 5): Promise<PickledResult[]> {
    const results = await this.verifyLinks(urls, runtimeOptions, concurrency);
    return results.map(res => ({
      url: res.url.original,
      safe: res.safe,
      decision: res.decision,
      trustScore: res.trustScore,
      riskScore: res.riskScore,
      classification: res.classification as Classification,
      threatLevel: res.threat.level as any,
      securityBadge: res.badge.label,
      riskColor: res.badge.color,
      summary: res.summary,
      recommendation: res.recommendation
    }));
  }
}
