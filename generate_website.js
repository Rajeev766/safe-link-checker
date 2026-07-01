import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'apps/docs/docs');
const INTEGRATIONS_DIR = path.join(process.cwd(), 'integrations');

if (!fs.existsSync(INTEGRATIONS_DIR)) fs.mkdirSync(INTEGRATIONS_DIR, { recursive: true });

const websiteFiles = {
  'enterprise.md': `# Enterprise Support

\`safe-link-checker\` is open-source, but we offer commercial support for large organizations.

## Safe Link Cloud
Connect your SDK to our global threat intelligence network.
- Sub-10ms global latency
- Real-time zero-day phishing feeds
- SOC2 compliant logging

[Contact Sales](#)
`,
  'cloud.md': `# Safe Link Cloud

The cloud platform gives you the power of \`safe-link-checker\` without the CPU overhead on your clients.

## Features
- **Telemetry Dashboard**: See exactly which malicious URLs your users are clicking.
- **Custom Blocklists**: Sync company-wide policies in real-time.
- **Webhooks**: Get alerted when a VIP user receives a phishing link.
`,
  'pricing.md': `# Pricing

## Open Source (Free)
- Full local heuristic engine
- Bounded concurrency
- All runtime support

## Pro ($49/mo)
- Safe Link Cloud API Access
- 1M scans / month
- Real-time threat feeds

## Enterprise (Custom)
- Dedicated support SLA
- Custom threat intelligence ingestion
- On-prem deployment options
`,
  'community.md': `# Community

Join the \`safe-link-checker\` community!

- **[Discord](#)**: Chat with other developers and the core team.
- **[GitHub Discussions](https://github.com/Rajeev766/safe-link-checker/discussions)**: Propose features and ask for help.
- **[X/Twitter](#)**: Follow us for release announcements and security research.
`,
  'playground.md': `---
layout: page
---
<script setup>
import { ref } from 'vue'
import { verifyLink } from 'safe-link-checker'

const url = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref(null)

const check = async () => {
  if (!url.value) return
  loading.value = true
  error.value = null
  try {
    result.value = await verifyLink(url.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

# Interactive Playground

Test the heuristic engine directly in your browser.

<div class="playground-container">
  <input v-model="url" type="url" placeholder="https://example.com" @keyup.enter="check" />
  <button @click="check" :disabled="loading">{{ loading ? 'Checking...' : 'Verify Link' }}</button>

  <div v-if="error" class="error">{{ error }}</div>

  <div v-if="result" class="result" :class="{ safe: result.safe, danger: !result.safe }">
    <h2>Score: {{ result.trustScore }}/100</h2>
    <p><strong>Decision:</strong> {{ result.decision }}</p>
    <p><strong>Summary:</strong> {{ result.summary }}</p>
    <details>
      <summary>View Evidence</summary>
      <pre>{{ JSON.stringify(result.evidence, null, 2) }}</pre>
    </details>
  </div>
</div>

<style>
.playground-container { margin-top: 2rem; padding: 2rem; background: var(--vp-c-bg-soft); border-radius: 8px; }
input { width: 100%; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; margin-bottom: 1rem; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
button { background: var(--vp-c-brand); color: white; padding: 0.75rem 1.5rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
button:disabled { opacity: 0.5; }
.result { margin-top: 2rem; padding: 1.5rem; border-radius: 8px; }
.safe { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
.danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
.error { color: red; margin-top: 1rem; }
</style>
`
};

const integrationFiles = {
  'astro/README.md': `# Astro Integration\nUse \`safe-link-checker\` in Astro middleware.`,
  'remix/README.md': `# Remix Integration\nUse \`safe-link-checker\` in Remix loaders and actions.`,
  'hono/README.md': `# Hono Integration\nUse \`safe-link-checker\` as Hono middleware on Cloudflare Workers.`
};

Object.entries(websiteFiles).forEach(([relPath, content]) => {
  const fullPath = path.join(DOCS_DIR, relPath);
  fs.writeFileSync(fullPath, content);
  console.log('Created apps/docs/docs/' + relPath);
});

Object.entries(integrationFiles).forEach(([relPath, content]) => {
  const fullPath = path.join(INTEGRATIONS_DIR, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created integrations/' + relPath);
});
