/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
export type HttpsStatus = 'HTTPS' | 'HTTP_ONLY' | 'CERT_ERROR' | 'TIMEOUT' | 'UNREACHABLE' | 'SKIPPED';
export type RedirectAnomalyKind = 'LOOP' | 'PROTOCOL_DOWNGRADE' | 'MAX_REDIRECTS_EXCEEDED';

export type RiskCategory = 'domain' | 'certificate' | 'redirect' | 'content' | 'network' | 'provider' | 'browser' | 'email' | 'qr' | 'download' | 'behavior' | 'ai' | 'other';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type DecisionAction = 'allow' | 'warn' | 'block' | 'unknown' | 'ALLOW' | 'WARN' | 'REVIEW' | 'BLOCK' | 'ESCALATE';

export type Classification = 
  | 'trusted'
  | 'safe'
  | 'suspicious'
  | 'unknown'
  | 'tracking'
  | 'spam'
  | 'phishing'
  | 'malware'
  | 'credential_theft'
  | 'scam'
  | 'brand_impersonation'
  | 'typosquatting'
  | 'Safe'
  | 'Suspicious'
  | 'Phishing'
  | 'Malware'
  | 'Scam'
  | 'Typosquatting'
  | 'Brand Impersonation'
  | 'Tracking'
  | 'Unsafe'
  | 'Unknown';

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface ObservabilityHooks {
  onStart?: (url: string, options: VerifyOptions) => void;
  onFinish?: (result: VerificationResult) => void;
  onWarning?: (url: string, reasons: string[]) => void;
  onBlocked?: (url: string, reasons: string[]) => void;
  onProvider?: (providerName: string, result: CheckResult) => void;
  onCacheHit?: (url: string) => void;
  onCacheMiss?: (url: string) => void;
}

export interface VerifyOptions {
  maxRedirects?: number;
  timeout?: number;
  customShorteners?: string[];
  bypassCache?: boolean;
  removeTrackingParams?: boolean;
  checkHttps?: boolean;
  signal?: AbortSignal;
  policy?: string; // e.g. 'strict', 'balanced', 'enterprise', 'financial'
  hooks?: ObservabilityHooks;
  realtime?: boolean;
  cloud?: {
    enabled: boolean;
    apiKey: string;
    endpoint?: string;
  };
  telemetry?: {
    enabled: boolean;
    level?: 'anonymous' | 'full';
  };
  debug?: boolean;
}

export interface CheckResult {
  // Legacy / Back-Compat
  name: string;
  safe: boolean;
  scoreImpact: number;
  message: string;
  weight?: number;
  fatal?: boolean;

  // XTI / Reputation Engine
  detector?: string;
  category?: RiskCategory;
  severity?: RiskSeverity;
  confidence?: number;
  scoreContribution?: number;
  title?: string;
  description?: string;
  recommendation?: string;
  references?: string[];
  executionTime?: number;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface Provider {
  name: string;
  check(url: string, options?: VerifyOptions): Promise<CheckResult | null>;
}

export interface RedirectHop {
  url: string;
  statusCode: number;
}

export interface RedirectTrace {
  chain: string[];
  finalUrl: string;
  redirectCount: number;
  anomalies: RedirectAnomalyKind[];
}

export interface ExecutionTimeline {
  phase: string;
  startTime: number;
  durationMs: number;
  status: 'success' | 'error' | 'skipped';
}

export interface RichMetadata {
  favicon?: string;
  title?: string;
  description?: string;
  openGraph?: Record<string, string>;
  twitterCards?: Record<string, string>;
  canonicalUrl?: string;
  detectedBrand?: string;
  detectedLanguage?: string;
  contentType?: string;
  server?: string;
  country?: string;
  hostingProvider?: string;
  asn?: string;
}

export interface ExecutionStats {
  totalTimeMs: number;
  startTime: number;
  endTime: number;
}

// -----------------------------------------------------------------------------
// NEW SECURITY REPORT TYPES
// -----------------------------------------------------------------------------

export interface VerificationMeta {
  mode: 'offline' | 'online' | 'hybrid';
  engine: 'heuristics' | 'network' | 'cloud' | 'combined';
  version: string;
  duration: number;
  cached: boolean;
  cacheSource: 'memory' | 'redis' | 'filesystem' | 'cloud' | 'none';
  timestamp: string;
}

export interface Evidence {
  id: string;
  title: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped' | 'unknown';
  weight: number;
  message: string;
  recommendation?: string;
  documentationUrl?: string;
}

export interface Capabilities {
  runtime: string;
  performed: string[];
  skipped: string[];
}

export interface SecurityBadge {
  label: string;
  variant: 'success' | 'warn' | 'block' | 'unknown' | 'allow';
  icon: string;
  color: string;
}

export interface VisualScore {
  value: number;
  max: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
}

export interface ThreatDetails {
  level: string; // 'low', 'medium', 'high', 'critical'
  category: string; // e.g. 'trusted', 'malware', etc.
  family: string | null;
  techniques: string[];
}

export interface UrlDetails {
  original: string;
  normalized: string;
  hostname: string;
  domain: string;
  subdomain: string;
  tld: string;
  protocol: string;
  port: string;
  path: string;
  query: string;
  hash: string;
}

export interface PerformanceMetrics {
  duration: number;
  cacheHit: boolean;
  cacheKey?: string;
  pluginsExecuted: number;
  pluginsSkipped: number;
}

export interface PluginExecutionDetails {
  plugin: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  scoreContribution: number;
}

export interface VerificationResult {
  // Top Level
  safe: boolean;
  decision: DecisionAction;
  classification: Classification;
  trustScore: number;
  riskScore: number;
  confidence: number;
  severity: RiskSeverity | string;
  summary: string;
  recommendation: string;
  runtime: string;
  
  // Structured Details
  verification: VerificationMeta;
  evidence: Evidence[];
  capabilities: Capabilities;
  badge: SecurityBadge;
  score: VisualScore;
  threat: ThreatDetails;
  url: UrlDetails;
  performance: PerformanceMetrics;
  
  // Debug
  pluginResults?: PluginExecutionDetails[];

  // Legacy / Back-Compat
  riskLevel?: RiskLevel;
  reasons?: string[];
  recommendations?: string[];
  checks?: CheckResult[];
  categories?: Record<string, number>;
  providerResults?: CheckResult[];
  redirectChain?: string[];
  redirectTrace?: RedirectTrace;
  fromCache?: boolean;
  action?: string;
  policy?: string;
  timeline?: ExecutionTimeline[];
  execution?: ExecutionStats;
  metadata?: RichMetadata | Record<string, unknown>;

  // Helpers (Non-enumerable, but strongly typed)
  isSafe?: () => boolean;
  shouldWarn?: () => boolean;
  shouldBlock?: () => boolean;
  toJSON?: () => any;
  toString?: () => string;
  toMarkdown?: () => string;
  toHTML?: () => string;
  export?: (format: 'json' | 'markdown' | 'html') => string;
}

export interface PickledResult {
  url: string;
  safe: boolean;
  decision: DecisionAction;
  trustScore: number;
  riskScore: number;
  classification: Classification;
  threatLevel: ThreatLevel;
  securityBadge: string;
  riskColor: string;
  summary: string;
  recommendation: string;
}
