export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
export type HttpsStatus = 'HTTPS' | 'HTTP_ONLY' | 'CERT_ERROR' | 'TIMEOUT' | 'UNREACHABLE' | 'SKIPPED';
export type RedirectAnomalyKind = 'LOOP' | 'PROTOCOL_DOWNGRADE' | 'MAX_REDIRECTS_EXCEEDED';

export interface VerifyOptions {
  maxRedirects?: number;
  timeout?: number;
  customShorteners?: string[];
  bypassCache?: boolean;
  removeTrackingParams?: boolean;
  checkHttps?: boolean;
  signal?: AbortSignal;
}

export interface CheckResult {
  name: string;
  safe: boolean;
  scoreImpact: number;
  message: string;
  metadata?: Record<string, unknown>;
  weight?: number; // Configured weight (defaults to 1.0)
  confidence?: number; // 0-100 confidence of this result
}

export interface Provider {
  name: string;
  check(url: string, options?: VerifyOptions): Promise<CheckResult | null>;
}

/** A single hop in the redirect chain. */
export interface RedirectHop {
  url: string;
  statusCode: number;
}

/** Structured result of the redirect analysis. */
export interface RedirectTrace {
  chain: string[];          // ordered list of all visited URLs (including start)
  finalUrl: string;         // last URL reached
  redirectCount: number;    // number of actual redirects followed
  anomalies: RedirectAnomalyKind[];
}

export interface VerificationResult {
  url: string;
  normalizedUrl: string;
  safe: boolean;
  score: number;
  confidence: number; // 0-100 overall confidence score
  riskLevel: RiskLevel;
  reasons: string[];              // Detailed reasons for the risk score
  recommendations: string[];      // Actionable recommendations based on the findings
  redirectChain: string[];        // flat chain kept for backward-compat
  redirectTrace: RedirectTrace;   // rich structured data
  checks: CheckResult[];
  fromCache: boolean;
}
