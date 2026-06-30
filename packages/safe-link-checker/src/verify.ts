import type { VerifyOptions, VerificationResult } from './types/index.js';
import { normalizeLink } from './utils/normalize.js';
import { calculateScore } from './utils/score.js';
import { validateUrl } from './validators/url.js';
import { validateIp } from './validators/ip.js';
import { validateHttps } from './validators/https.js';
import { traceRedirects } from './validators/redirect.js';
import { validatePunycode } from './validators/punycode.js';
import { validateShortener } from './validators/shortener.js';
import { validateHeuristics } from './validators/heuristic.js';

export async function verifyLink(
  url: string,
  options: VerifyOptions = {}
): Promise<VerificationResult> {
  const normalizedUrl = normalizeLink(url, options);
  const urlVal = validateUrl(normalizedUrl);

  // Short-circuit: malformed / unsupported-protocol URLs skip all further checks
  if (!urlVal.safe) {
    const scoreInfo = calculateScore([urlVal]);
    return {
      url,
      normalizedUrl,
      safe: scoreInfo.safe,
      score: scoreInfo.score, confidence: 100,
      riskLevel: scoreInfo.riskLevel,
      reasons: scoreInfo.reasons,
      recommendations: scoreInfo.recommendations,
      redirectChain: [],
      redirectTrace: { chain: [], finalUrl: normalizedUrl, redirectCount: 0, anomalies: [] },
      checks: [urlVal],
      fromCache: false,
    };
  }

  const shortVal = validateShortener(normalizedUrl, options.customShorteners);
  const isShortener = shortVal.metadata?.isShortener === true;

  const initialIpVal = validateIp(normalizedUrl);

  // If the host is private/local, skip the outbound redirect trace
  if (!initialIpVal.safe) {
    const heurVal = validateHeuristics(normalizedUrl);
    const checks = [urlVal, shortVal, initialIpVal, heurVal];
    const scoreInfo = calculateScore(checks);
    return {
      url,
      normalizedUrl,
      safe: scoreInfo.safe,
      score: scoreInfo.score, confidence: 100,
      riskLevel: scoreInfo.riskLevel,
      reasons: scoreInfo.reasons,
      recommendations: scoreInfo.recommendations,
      redirectChain: [],
      redirectTrace: { chain: [], finalUrl: normalizedUrl, redirectCount: 0, anomalies: [] },
      checks,
      fromCache: false,
    };
  }

  const redirectTrace = await traceRedirects(normalizedUrl, options);
  
  // If it's a shortener, we score the final expanded URL. Otherwise we score the initial URL.
  const targetUrl = isShortener ? redirectTrace.finalUrl : normalizedUrl;
  
  let ipVal = initialIpVal;
  if (isShortener && targetUrl !== normalizedUrl) {
    ipVal = validateIp(targetUrl);
    if (!ipVal.safe) {
      // The shortener resolved to a local IP
      const heurVal = validateHeuristics(targetUrl);
      const checks = [urlVal, shortVal, ipVal, heurVal];
      const scoreInfo = calculateScore(checks);
      return {
        url,
        normalizedUrl,
        safe: scoreInfo.safe,
        score: scoreInfo.score, confidence: 100,
        riskLevel: scoreInfo.riskLevel,
        reasons: scoreInfo.reasons,
        recommendations: scoreInfo.recommendations,
        redirectChain: redirectTrace.chain,
        redirectTrace,
        checks,
        fromCache: false,
      };
    }
  }

  const punyVal = validatePunycode(targetUrl);
  const heurVal = validateHeuristics(targetUrl);
  let checks = [urlVal, shortVal, ipVal, punyVal, heurVal];

  // HTTPS check — opt-out via checkHttps:false; defaults to enabled
  if (options.checkHttps !== false) {
    const timeout = options.timeout ?? 5000;
    const httpsVal = await validateHttps(targetUrl, timeout, options.signal);
    checks.push(httpsVal);
  }

  const scoreInfo = calculateScore(checks);

  return {
    url,
    normalizedUrl,
    safe: scoreInfo.safe,
    score: scoreInfo.score, confidence: 100,
    riskLevel: scoreInfo.riskLevel,
    reasons: scoreInfo.reasons,
    recommendations: scoreInfo.recommendations,
    redirectChain: redirectTrace.chain,
    redirectTrace,
    checks,
    fromCache: false,
  };
}


