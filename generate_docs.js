import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'apps/docs/docs');

const pages = {
  'guide/installation.md': `# Installation\n\nInstall using your preferred package manager.\n\n\`\`\`bash\nnpm install safe-link-checker\n\`\`\``,
  'guide/runtime-detection.md': `# Runtime Detection\n\n\`safe-link-checker\` automatically detects the environment and uses the optimal implementation.`,
  'guide/evidence.md': `# Evidence & Analysis\n\nEvery result includes an \`evidence\` array explaining the trust score.`,
  'guide/providers.md': `# Providers\n\nProviders query external threat intelligence feeds (e.g., URLHaus, OpenPhish).`,
  
  // Platforms
  'guide/platforms/node.md': `# Node.js\n\nFull capabilities including DNS, TLS validation, and redirect tracing.`,
  'guide/platforms/browser.md': `# Browser\n\nLightweight runtime using \`fetch\` and heuristic checks.`,
  'guide/platforms/react-native.md': `# React Native\n\nSecure mobile deep-linking with heuristic analysis.`,
  'guide/platforms/expo.md': `# Expo\n\nWorks out of the box in Expo managed and bare workflows.`,
  'guide/platforms/nextjs.md': `# Next.js\n\nWorks seamlessly in Server Components and API Routes.`,
  'guide/platforms/cloudflare.md': `# Cloudflare Workers\n\nOptimized Edge runtime for minimal latency.`,
  'guide/platforms/vercel-edge.md': `# Vercel Edge\n\nHigh-performance fetch-based runtime.`,
  'guide/platforms/bun.md': `# Bun\n\nLightning-fast Node.js compatibility mode.`,
  'guide/platforms/deno.md': `# Deno\n\nSecure runtime execution.`,
  'guide/platforms/electron.md': `# Electron\n\nProtects desktop apps from malicious URLs.`,

  // Backend
  'guide/backend/express.md': `# Express\n\nIntegrate with Express middleware and routes.`,
  'guide/backend/fastify.md': `# Fastify\n\nHigh-performance URL verification endpoints.`,
  'guide/backend/nestjs.md': `# NestJS\n\nInject SafeLinkChecker as a provider.`,

  // Cloud
  'guide/cloud/overview.md': `# Cloud Mode Overview\n\nDelegate heavy analysis to Safe Link Cloud.`,
  'guide/cloud/api.md': `# API Gateway\n\nRESTful API for URL verification.`,
  'guide/cloud/realtime.md': `# Real-time Sync\n\nSubscribe to threat intelligence updates.`,
  'guide/cloud/telemetry.md': `# Telemetry\n\nBatched analytics reporting.`,

  // Security
  'guide/security/ssrf.md': `# SSRF Protection\n\nBlocks private IPs, localhost, and protocol downgrades.`,
  'guide/security/dns-rebinding.md': `# DNS Rebinding\n\nSecure DNS resolution and connection handling.`,
  'guide/security/homograph.md': `# Homograph Attacks\n\nDetects Punycode and lookalike domains.`,
  'guide/security/disclosure.md': `# Responsible Disclosure\n\nHow to report security vulnerabilities securely.`,

  // Performance
  'guide/performance/benchmarks.md': `# Benchmarks\n\nLatency, throughput, and memory measurements.`,
  'guide/performance/caching.md': `# Caching\n\nLRU cache configuration and best practices.`,
  'guide/performance/concurrency.md': `# Concurrency\n\nBounded schedulers for batch verification.`,
  'guide/performance/tree-shaking.md': `# Tree-Shaking\n\nOptimizing bundle size for frontend apps.`,

  // Advanced
  'guide/advanced/custom-plugins.md': `# Custom Plugins\n\nWrite your own analysis plugins.`,
  'guide/advanced/custom-providers.md': `# Custom Providers\n\nIntegrate internal threat feeds.`,
  'guide/advanced/hooks.md': `# Hooks & Observability\n\nLifecycle events for logging and metrics.`,
  'guide/advanced/abort.md': `# Abort & Cancellation\n\nUsing AbortSignal to cancel verifications.`,

  // Reference
  'guide/migration.md': `# Migration Guide\n\nHow to upgrade from older versions.`,
  'guide/faq.md': `# FAQ\n\nFrequently asked questions.`,
  'guide/troubleshooting.md': `# Troubleshooting\n\nCommon issues and fixes.`,
  'changelog.md': `# Changelog\n\nRelease notes and version history.`,

  // API Reference
  'api/verify-link.md': `# verifyLink()\n\nVerifies a single URL.`,
  'api/verify-links.md': `# verifyLinks()\n\nVerifies an array of URLs concurrently.`,
  'api/extract-urls.md': `# extractUrls()\n\nFinds URLs in text.`,
  'api/normalize-url.md': `# normalizeUrl()\n\nStandardizes URLs for analysis.`,
  'api/safe-link-checker.md': `# SafeLinkChecker\n\nThe core class for stateful instances.`,
  'api/cloud-gateway.md': `# CloudGateway\n\nManages cloud communication.`,
  'api/types/verification-result.md': `# VerificationResult\n\nThe full output of a verification.`,
  'api/types/checker-options.md': `# CheckerOptions\n\nConfiguration for SafeLinkChecker.`,
  'api/types/verify-options.md': `# VerifyOptions\n\nPer-call options.`,
  'api/types/verification-plugin.md': `# VerificationPlugin\n\nPlugin interface.`,
  'api/types/provider.md': `# Provider\n\nThreat intelligence provider interface.`,
  'api/types/check-result.md': `# CheckResult\n\nOutput of a single check.`,
  'api/types/pickled-result.md': `# PickledResult\n\nOptimized result format for batches.`,
  'api/errors/safe-link-error.md': `# SafeLinkError\n\nBase error class.`,
  'api/errors/timeout-error.md': `# TimeoutError\n\nThrown when verification times out.`,
};

// Create directories and write files
Object.entries(pages).forEach(([relPath, content]) => {
  const fullPath = path.join(DOCS_DIR, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log(`Created ${relPath}`);
});
