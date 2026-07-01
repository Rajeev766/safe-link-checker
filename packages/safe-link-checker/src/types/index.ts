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
export type DecisionAction = 'allow' | 'warn' | 'review' | 'block';

export interface VerifyOptions {
  maxRedirects?: number;
  timeout?: number;
  customShorteners?: string[];
  bypassCache?: boolean;
  removeTrackingParams?: boolean;
  checkHttps?: boolean;
  signal?: AbortSignal;
  policy?: string; // e.g. 'strict', 'balanced', 'enterprise'
}

export interface CheckResult {
  // --- Legacy / Back-Compat ---
  name: string;
  safe: boolean;
  scoreImpact: number;
  message: string;
  weight?: number;
  fatal?: boolean;

  // --- Phase 1: XTI ---
  detector?: string;
  category?: RiskCategory;
  severity?: RiskSeverity;
  confidence?: number; // 0-1 (Normalized XTI confidence), or 0-100 legacy
  scoreContribution?: number; // alias for scoreImpact
  title?: string;
  description?: string; // alias for message
  recommendation?: string;
  references?: string[];
  executionTime?: number;
  timestamp?: number;

  // --- Phase 9: Metadata ---
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
  // Legacy
  url: string;
  normalizedUrl: string;
  safe: boolean;
  score: number;
  confidence: number;
  riskLevel: RiskLevel;
  reasons: string[];
  recommendations: string[];
  redirectChain: string[];
  redirectTrace: RedirectTrace;
  checks: CheckResult[];
  fromCache: boolean;

  // New XTI & Decision Engine Fields
  decision?: DecisionAction;
  trustScore?: number;
  summary?: string;
  action?: string;
  policy?: string;
  timeline?: ExecutionTimeline[];
  evidence?: CheckResult[];
  providerResults?: CheckResult[];
  categories?: Record<string, number>;
  execution?: ExecutionStats;
  metadata?: RichMetadata | Record<string, unknown>;
}
