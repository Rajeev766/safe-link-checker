import type { VerifyOptions, RedirectTrace, RedirectAnomalyKind } from '../types/index.js';
import http from 'http';
import https from 'https';
import type { IncomingMessage } from 'http';

const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 5000;
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

// ─── Public API ───────────────────────────────────────────────────────────────

export async function traceRedirects(
  urlStr: string,
  options: VerifyOptions = {},
): Promise<RedirectTrace> {
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS;

  const chain: string[] = [urlStr];
  const seen = new Set<string>([urlStr]);
  const anomalies: RedirectAnomalyKind[] = [];

  let current = urlStr;

  for (let hop = 0; hop < maxRedirects; hop++) {
    const result = await headRequest(current, timeoutMs, options.signal);

    if (!result) {
      // Network error / timeout — stop here, treat current as final
      break;
    }

    if (!REDIRECT_CODES.has(result.statusCode)) {
      // Non-redirect response — we've reached the final destination
      break;
    }

    const location = result.location;
    if (!location) {
      // Redirect without Location header — treat as terminal
      break;
    }

    // Resolve relative locations against the current URL
    let nextUrl: string;
    try {
      nextUrl = new URL(location, current).toString();
    } catch {
      break; // Unparseable location — stop
    }

    // ── Anomaly: redirect loop ────────────────────────────────────────────────
    if (seen.has(nextUrl)) {
      if (!anomalies.includes('LOOP')) anomalies.push('LOOP');
      break;
    }

    // ── Anomaly: protocol downgrade (https → http) ────────────────────────────
    if (current.startsWith('https://') && nextUrl.startsWith('http://')) {
      if (!anomalies.includes('PROTOCOL_DOWNGRADE')) anomalies.push('PROTOCOL_DOWNGRADE');
    }

    seen.add(nextUrl);
    chain.push(nextUrl);
    current = nextUrl;
  }

  // If we consumed all redirect slots and there might be more, flag it
  if (chain.length - 1 >= maxRedirects) {
    const result = await headRequest(current, timeoutMs, options.signal);
    if (result && REDIRECT_CODES.has(result.statusCode)) {
      if (!anomalies.includes('MAX_REDIRECTS_EXCEEDED')) {
        anomalies.push('MAX_REDIRECTS_EXCEEDED');
      }
    }
  }

  return {
    chain,
    finalUrl: current,
    redirectCount: chain.length - 1,
    anomalies,
  };
}

// ─── Internal probe ───────────────────────────────────────────────────────────

interface HeadResult {
  statusCode: number;
  location: string | undefined;
}

function headRequest(urlStr: string, timeoutMs: number, signal?: AbortSignal): Promise<HeadResult | null> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (v: HeadResult | null) => {
      if (!settled) { settled = true; resolve(v); }
    };

    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      return settle(null);
    }

    const isHttps = parsed.protocol === 'https:';
    const requester = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      timeout: timeoutMs,
      signal,
      // Skip cert validation so we can follow chains even with bad certs
      // (the https validator is responsible for cert scoring separately)
      rejectUnauthorized: false,
    };

    const req = requester.request(options, (res: IncomingMessage) => {
      res.resume(); // drain to avoid socket hang
      settle({
        statusCode: res.statusCode ?? 0,
        location: Array.isArray(res.headers.location)
          ? res.headers.location[0]
          : res.headers.location,
      });
    });

    req.on('timeout', () => { req.destroy(); settle(null); });
    req.on('error', () => settle(null));
    req.end();
  });
}

