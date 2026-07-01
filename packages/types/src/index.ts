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
export type DecisionAction = 'ALLOW' | 'WARN' | 'REVIEW' | 'BLOCK' | 'ESCALATE';

export type Classification = 
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

export interface VerificationResult {
  // Core Identifiers
  url: string;
  normalizedUrl: string;
  safe: boolean; // Legacy
  
  // Reputation Engine Scores
  trustScore: number; // 0-100
  riskScore: number; // 0-100
  confidence: number; // 0-100
  
  // Classifications
  classification: Classification;
  threatLevel: ThreatLevel;
  riskLevel: RiskLevel; // Legacy
  decision: DecisionAction;
  
  // Explanations
  summary: string;
  recommendation: string;
  reasons: string[]; // Legacy
  recommendations: string[]; // Legacy
  
  // Evidence
  evidence: CheckResult[];
  checks: CheckResult[]; // Legacy
  providerResults: CheckResult[];
  categories: Record<string, number>;
  
  // Trace Data
  redirectChain: string[];
  redirectTrace: RedirectTrace;
  
  // Meta
  fromCache: boolean;
  action?: string;
  policy?: string;
  timeline?: ExecutionTimeline[];
  execution?: ExecutionStats;
  metadata?: RichMetadata | Record<string, unknown>;
  runtime?: string;
  capabilities?: {
    performed: string[];
    skipped: string[];
  };
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

