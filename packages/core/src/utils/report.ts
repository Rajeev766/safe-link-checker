import type { 
  VerificationResult, 
  VerificationMeta, 
  Evidence, 
  Capabilities, 
  SecurityBadge, 
  VisualScore, 
  ThreatDetails, 
  UrlDetails, 
  PerformanceMetrics, 
  PluginExecutionDetails,
  CheckResult,
  DecisionAction,
  Classification,
  RiskSeverity,
  RedirectTrace,
  RichMetadata,
  RiskLevel
} from '@safe-link-checker/types';

export interface ReportData {
  url: string;
  normalizedUrl: string;
  safe: boolean;
  decision: DecisionAction;
  classification: Classification;
  trustScore: number;
  riskScore: number;
  confidence: number;
  threatLevel: string;
  summary: string;
  recommendation: string;
  runtime: string;
  
  checks: CheckResult[];
  redirectTrace?: RedirectTrace;
  fromCache?: boolean;
  cacheKey?: string;
  policy?: string;
  metadata?: RichMetadata | Record<string, unknown>;
  startTime: number;
  endTime: number;
  pluginsExecuted: number;
  pluginsSkipped: number;
  
  performedCapabilities: string[];
  skippedCapabilities: string[];
  pluginResults?: PluginExecutionDetails[];
  debug?: boolean;
}

export function createSecurityReport(data: ReportData): VerificationResult {
  const duration = data.endTime - data.startTime;

  // Build URL details safely
  let urlDetails: UrlDetails = {
    original: data.url,
    normalized: data.normalizedUrl,
    hostname: '',
    domain: '',
    subdomain: '',
    tld: '',
    protocol: '',
    port: '',
    path: '',
    query: '',
    hash: ''
  };

  try {
    const parsed = new URL(data.normalizedUrl);
    const hostnameParts = parsed.hostname.split('.');
    
    urlDetails.hostname = parsed.hostname;
    urlDetails.protocol = parsed.protocol.replace(':', '');
    urlDetails.port = parsed.port || (urlDetails.protocol === 'https' ? '443' : '80');
    urlDetails.path = parsed.pathname;
    urlDetails.query = parsed.search;
    urlDetails.hash = parsed.hash;

    if (hostnameParts.length >= 2) {
      urlDetails.tld = hostnameParts[hostnameParts.length - 1]!;
      urlDetails.domain = `${hostnameParts[hostnameParts.length - 2]}.${urlDetails.tld}`;
      if (hostnameParts.length > 2) {
        urlDetails.subdomain = hostnameParts.slice(0, hostnameParts.length - 2).join('.');
      }
    } else {
      urlDetails.domain = parsed.hostname;
    }
  } catch (e) {
    // Ignore URL parse errors for invalid URLs
  }

  // Build Evidence
  const evidence: Evidence[] = data.checks.map(c => {
    const ev: Evidence = {
      id: c.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: c.title || c.name,
      category: c.category || 'other',
      status: c.safe ? 'passed' : c.fatal ? 'failed' : 'failed',
      weight: c.weight || 1,
      message: c.message || c.description || c.name
    };
    if (c.recommendation) ev.recommendation = c.recommendation;
    return ev;
  });

  // Calculate severity
  let severity: RiskSeverity = 'info';
  if (data.riskScore > 75) severity = 'critical';
  else if (data.riskScore > 50) severity = 'high';
  else if (data.riskScore > 25) severity = 'medium';
  else if (data.riskScore > 0) severity = 'low';

  // Build Badge
  const getBadge = (): SecurityBadge => {
    if (data.decision.toLowerCase() === 'block') {
      return { label: 'Dangerous', variant: 'block', icon: 'shield-alert', color: '#dc2626' };
    }
    if (data.decision.toLowerCase() === 'warn') {
      return { label: 'Suspicious', variant: 'warn', icon: 'shield-alert', color: '#ca8a04' };
    }
    if (data.decision.toLowerCase() === 'allow') {
      return { label: 'Trusted', variant: 'success', icon: 'shield-check', color: '#16a34a' };
    }
    return { label: 'Unknown', variant: 'unknown', icon: 'shield', color: '#6b7280' };
  };

  const badge = getBadge();

  // Build Score
  let grade: VisualScore['grade'] = 'A+';
  if (data.trustScore < 60) grade = 'F';
  else if (data.trustScore < 70) grade = 'D';
  else if (data.trustScore < 80) grade = 'C';
  else if (data.trustScore < 90) grade = 'B';
  else if (data.trustScore < 95) grade = 'A';

  const score: VisualScore = {
    value: data.trustScore,
    max: 100,
    grade,
    label: grade === 'A+' ? 'Excellent' : grade === 'A' ? 'Good' : grade === 'B' ? 'Fair' : grade === 'C' ? 'Poor' : 'Dangerous'
  };

  // Build Threat
  const threat: ThreatDetails = {
    level: data.threatLevel.toLowerCase(),
    category: data.classification.toLowerCase(),
    family: null, // Hard to determine without specific engine output
    techniques: data.checks.filter(c => !c.safe).map(c => c.title || c.name)
  };

  const categories: Record<string, number> = {};
  for (const c of data.checks) {
    const cat = c.category || 'other';
    categories[cat] = (categories[cat] || 0) + (c.scoreContribution || c.scoreImpact || 0);
  }

  const performance: PerformanceMetrics = {
    duration,
    cacheHit: !!data.fromCache,
    pluginsExecuted: data.pluginsExecuted,
    pluginsSkipped: data.pluginsSkipped
  };
  if (data.cacheKey) performance.cacheKey = data.cacheKey;

  // Base raw object
  const report: VerificationResult = {
    safe: data.safe,
    decision: data.decision,
    classification: data.classification.toLowerCase() as Classification,
    trustScore: data.trustScore,
    riskScore: data.riskScore,
    confidence: data.confidence,
    severity,
    summary: data.summary,
    recommendation: data.recommendation,
    runtime: data.runtime,
    
    verification: {
      mode: 'offline', // Simplified, should be derived
      engine: 'combined',
      version: '1.0.0', // SDK version
      duration,
      cached: !!data.fromCache,
      cacheSource: data.fromCache ? 'memory' : 'none',
      timestamp: new Date().toISOString()
    },
    
    evidence,
    capabilities: {
      runtime: data.runtime,
      performed: data.performedCapabilities,
      skipped: data.skippedCapabilities
    },
    badge,
    score,
    threat,
    url: urlDetails,
    performance,
    
    // Legacy mapping
    riskLevel: data.threatLevel === 'CRITICAL' ? 'DANGEROUS' : data.threatLevel === 'HIGH' ? 'DANGEROUS' : data.threatLevel === 'MEDIUM' ? 'SUSPICIOUS' : 'SAFE',

    reasons: data.checks.map(c => c.message || c.description || c.name),
    recommendations: [],
    checks: data.checks,
    providerResults: data.checks.filter(c => c.category === 'provider'),
    categories,
    redirectChain: data.redirectTrace?.chain || [],
    redirectTrace: data.redirectTrace || { chain: [], finalUrl: data.normalizedUrl, redirectCount: 0, anomalies: [] },
    fromCache: !!data.fromCache,
    action: data.decision.toLowerCase(),
  };
  
  if (data.metadata) report.metadata = data.metadata;
  if (data.policy) report.policy = data.policy;

  if (data.debug && data.pluginResults) {
    report.pluginResults = data.pluginResults;
  }

  return injectReportHelpers(report);
}

export function injectReportHelpers(report: any): VerificationResult {
  // Attach non-enumerable helpers
  Object.defineProperties(report, {
    isSafe: { value: () => report.safe, enumerable: false, configurable: true },
    shouldWarn: { value: () => report.decision.toLowerCase() === 'warn', enumerable: false, configurable: true },
    shouldBlock: { value: () => report.decision.toLowerCase() === 'block', enumerable: false, configurable: true },
    toJSON: { value: () => {
      // Return a shallow copy of the object itself to allow JSON.stringify to work naturally
      // Functions are naturally excluded by JSON.stringify anyway
      return { ...report };
    }, enumerable: false, configurable: true },
    toString: { value: () => JSON.stringify(report, null, 2), enumerable: false, configurable: true },
    toMarkdown: { value: () => generateMarkdown(report), enumerable: false, configurable: true },
    toHTML: { value: () => generateHtml(report), enumerable: false, configurable: true },
    export: { value: (format: string) => {
      if (format === 'json') return JSON.stringify(report, null, 2);
      if (format === 'markdown') return generateMarkdown(report);
      if (format === 'html') return generateHtml(report);
      throw new Error(`Unsupported format: ${format}`);
    }, enumerable: false, configurable: true }
  });

  return report as VerificationResult;
}

function generateMarkdown(report: VerificationResult): string {
  return `
# Security Report: ${report.url.original}

**Decision:** ${report.decision.toUpperCase()}
**Trust Score:** ${report.trustScore}/100
**Risk Score:** ${report.riskScore}/100
**Confidence:** ${report.confidence}%

## Summary
${report.summary}

## Recommendation
${report.recommendation}

## Evidence
${report.evidence.map(e => `- [${e.status === 'passed' ? '✓' : '✗'}] **${e.title}**: ${e.message}`).join('\n')}
`.trim();
}

function generateHtml(report: VerificationResult): string {
  const badgeColor = report.badge.color === 'green' ? '#10b981' : report.badge.color === 'yellow' ? '#f59e0b' : '#ef4444';
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Report: ${report.url.original}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; color: white; background-color: ${badgeColor}; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; }
    .card h3 { margin-top: 0; color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .card p { margin: 0; font-size: 1.5rem; font-weight: bold; }
    .evidence { list-style: none; padding: 0; }
    .evidence li { padding: 1rem; border-bottom: 1px solid #e5e7eb; }
    .evidence li:last-child { border-bottom: none; }
    .status-passed { color: #10b981; font-weight: bold; }
    .status-failed { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Security Report</h1>
  <p><strong>URL:</strong> <a href="${report.url.original}">${report.url.original}</a></p>
  <p><span class="badge">${report.badge.label}</span></p>

  <div class="grid">
    <div class="card"><h3>Decision</h3><p>${report.decision.toUpperCase()}</p></div>
    <div class="card"><h3>Trust Score</h3><p>${report.trustScore}/100</p></div>
    <div class="card"><h3>Risk Score</h3><p>${report.riskScore}/100</p></div>
    <div class="card"><h3>Confidence</h3><p>${report.confidence}%</p></div>
  </div>

  <h2>Summary</h2>
  <p>${report.summary}</p>

  <h2>Recommendation</h2>
  <p>${report.recommendation}</p>

  <h2>Evidence</h2>
  <ul class="evidence">
    ${report.evidence.map(e => `
      <li>
        <div>
          <span class="status-${e.status}">${e.status === 'passed' ? '✓ PASS' : '✗ FAIL'}</span>
          <strong>${e.title}</strong>
        </div>
        <div style="color: #4b5563; margin-top: 0.5rem;">${e.message}</div>
      </li>
    `).join('')}
  </ul>
</body>
</html>
  `.trim();
  return html;
}

