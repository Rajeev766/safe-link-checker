import type { CheckResult, HttpsStatus } from '../types/index.js';
import https from 'https';
import http from 'http';

const CERT_ERROR_CODES = new Set([
  'CERT_HAS_EXPIRED',
  'CERT_NOT_YET_VALID',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_SIGNATURE_FAILURE',
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'ERR_TLS_CERT_ALTNAME_INVALID',
]);

const TIMEOUT_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'SOCKET_TIMEOUT',
]);



function makeResult(
  status: HttpsStatus,
  safe: boolean,
  scoreImpact: number,
  message: string,
): CheckResult {
  return { name: 'HTTPS Validator', safe, scoreImpact, message, metadata: { httpsStatus: status } };
}

/**
 * Probes the URL for HTTPS availability and certificate validity.
 * Returns a CheckResult that is always fulfilled — never rejects.
 *
 * Score impact guide:
 *   HTTPS       →  0  (good)
 *   HTTP_ONLY   → 20  (SUSPICIOUS — no encryption)
 *   CERT_ERROR  → 40  (DANGEROUS — cert problem, MITM risk)
 *   TIMEOUT     →  0  (ambiguous; don't penalise for slow servers)
 *   UNREACHABLE →  0  (ambiguous; server may be fine — just unreachable from CI)
 *   SKIPPED     →  0  (opt-out)
 */
export async function validateHttps(
  urlStr: string,
  timeoutMs = 5000,
  signal?: AbortSignal
): Promise<CheckResult> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return makeResult('SKIPPED', true, 0, 'Could not parse URL for HTTPS check.');
  }

  // Already HTTP — probe whether an HTTPS equivalent exists
  if (parsed.protocol === 'http:') {
    const httpsUrl = urlStr.replace(/^http:/, 'https:');
    const httpsResult = await probeHttps(httpsUrl, timeoutMs, signal);

    if (httpsResult.status === 'HTTPS') {
      return makeResult(
        'HTTP_ONLY',
        false,
        20,
        'URL uses HTTP. An HTTPS version is available but the link uses an unencrypted connection.',
      );
    }
    if (httpsResult.status === 'CERT_ERROR') {
      return makeResult(
        'CERT_ERROR',
        false,
        40,
        `TLS/SSL certificate error on HTTPS probe: ${httpsResult.detail}`,
      );
    }
    // HTTPS probe timed out or unreachable — can't determine, pass through
    return makeResult(
      'HTTP_ONLY',
      false,
      20,
      'URL uses HTTP. Could not confirm whether an HTTPS version is available.',
    );
  }

  // HTTPS URL — probe and validate the certificate
  const result = await probeHttps(urlStr, timeoutMs, signal);

  switch (result.status) {
    case 'HTTPS':
      return makeResult('HTTPS', true, 0, 'HTTPS is enabled and the certificate is valid.');

    case 'CERT_ERROR':
      return makeResult(
        'CERT_ERROR',
        false,
        40,
        `TLS/SSL certificate error: ${result.detail}`,
      );

    case 'TIMEOUT':
      return makeResult(
        'TIMEOUT',
        true,
        0,
        'HTTPS probe timed out. The server may be slow or rate-limiting. No penalty applied.',
      );

    default:
      return makeResult(
        'UNREACHABLE',
        true,
        0,
        `HTTPS probe could not reach the server: ${result.detail}. No penalty applied.`,
      );
  }
}

// ─── Internal probe ───────────────────────────────────────────────────────────

interface ProbeResult {
  status: 'HTTPS' | 'CERT_ERROR' | 'TIMEOUT' | 'UNREACHABLE';
  detail: string;
}

function probeHttps(urlStr: string, timeoutMs: number, signal?: AbortSignal): Promise<ProbeResult> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (r: ProbeResult) => {
      if (!settled) {
        settled = true;
        resolve(r);
      }
    };

    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      return settle({ status: 'UNREACHABLE', detail: 'Malformed URL' });
    }

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      timeout: timeoutMs,
      signal,
      // We intentionally do NOT set rejectUnauthorized:false so cert errors surface
    };

    const req = https.request(options, (res: import('http').IncomingMessage) => {
      // Any HTTP response (even 4xx/5xx) means TLS handshake succeeded
      res.resume(); // consume and discard body
      settle({ status: 'HTTPS', detail: `HTTP ${res.statusCode}` });
    });

    req.on('timeout', () => {
      req.destroy();
      settle({ status: 'TIMEOUT', detail: 'Request timed out' });
    });

    req.on('error', (err: NodeJS.ErrnoException) => {
      const code = err.code ?? '';

      if (CERT_ERROR_CODES.has(code)) {
        return settle({ status: 'CERT_ERROR', detail: err.message });
      }
      if (TIMEOUT_ERROR_CODES.has(code)) {
        return settle({ status: 'TIMEOUT', detail: err.message });
      }
      settle({ status: 'UNREACHABLE', detail: err.message });
    });

    req.end();
  });
}

/**
 * Lightweight HTTP-only probe used by the redirect tracer.
 * Returns true if the host is reachable over plain HTTP.
 */
export function probeHttp(urlStr: string, timeoutMs: number, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (v: boolean) => { if (!settled) { settled = true; resolve(v); } };

    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      return settle(false);
    }

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      timeout: timeoutMs,
      signal,
    };

    const req = http.request(options, () => settle(true));
    req.on('timeout', () => { req.destroy(); settle(false); });
    req.on('error', () => settle(false));
    req.end();
  });
}
