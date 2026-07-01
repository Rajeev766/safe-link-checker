import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'safe-link-checker',
  description: 'The URL Intelligence SDK for every JavaScript runtime — Node.js, Browser, React Native, Expo, Edge, Bun, Deno.',
  lang: 'en-US',
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#0070f3' }],
    ['meta', { property: 'og:title', content: 'safe-link-checker' }],
    ['meta', { property: 'og:description', content: 'The URL Intelligence SDK for every JavaScript runtime' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],

  themeConfig: {
    siteTitle: '🔗 safe-link-checker',
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API Reference', link: '/api/verify-link' },
      { text: 'Examples', link: '/examples/node' },
      { text: 'Playground', link: '/playground' },
      {
        text: 'v2.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Migration Guide', link: '/guide/migration' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '🚀 Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Configuration', link: '/guide/configuration' },
          ]
        },
        {
          text: '🧠 Core Concepts',
          items: [
            { text: 'Trust Score', link: '/guide/trust-score' },
            { text: 'Runtime Detection', link: '/guide/runtime-detection' },
            { text: 'Evidence & Analysis', link: '/guide/evidence' },
            { text: 'Policies', link: '/guide/policies' },
            { text: 'Rules Engine', link: '/guide/rules' },
            { text: 'Plugins', link: '/guide/plugins' },
            { text: 'Providers', link: '/guide/providers' },
          ]
        },
        {
          text: '🌐 Platform Guides',
          items: [
            { text: 'Node.js', link: '/guide/platforms/node' },
            { text: 'Browser', link: '/guide/platforms/browser' },
            { text: 'React Native', link: '/guide/platforms/react-native' },
            { text: 'Expo', link: '/guide/platforms/expo' },
            { text: 'Next.js', link: '/guide/platforms/nextjs' },
            { text: 'Cloudflare Workers', link: '/guide/platforms/cloudflare' },
            { text: 'Vercel Edge', link: '/guide/platforms/vercel-edge' },
            { text: 'Bun', link: '/guide/platforms/bun' },
            { text: 'Deno', link: '/guide/platforms/deno' },
            { text: 'Electron', link: '/guide/platforms/electron' },
          ]
        },
        {
          text: '🖥 Backend Guides',
          items: [
            { text: 'Express', link: '/guide/backend/express' },
            { text: 'Fastify', link: '/guide/backend/fastify' },
            { text: 'NestJS', link: '/guide/backend/nestjs' },
          ]
        },
        {
          text: '☁️ Cloud Mode',
          items: [
            { text: 'Overview', link: '/guide/cloud/overview' },
            { text: 'API Gateway', link: '/guide/cloud/api' },
            { text: 'Real-time Sync', link: '/guide/cloud/realtime' },
            { text: 'Telemetry', link: '/guide/cloud/telemetry' },
          ]
        },
        {
          text: '🔒 Security',
          items: [
            { text: 'SSRF Protection', link: '/guide/security/ssrf' },
            { text: 'DNS Rebinding', link: '/guide/security/dns-rebinding' },
            { text: 'Homograph Attacks', link: '/guide/security/homograph' },
            { text: 'Responsible Disclosure', link: '/guide/security/disclosure' },
          ]
        },
        {
          text: '📈 Performance',
          items: [
            { text: 'Benchmarks', link: '/guide/performance/benchmarks' },
            { text: 'Caching', link: '/guide/performance/caching' },
            { text: 'Concurrency', link: '/guide/performance/concurrency' },
            { text: 'Tree-Shaking', link: '/guide/performance/tree-shaking' },
          ]
        },
        {
          text: '🛠 Advanced',
          items: [
            { text: 'Custom Plugins', link: '/guide/advanced/custom-plugins' },
            { text: 'Custom Providers', link: '/guide/advanced/custom-providers' },
            { text: 'Hooks & Observability', link: '/guide/advanced/hooks' },
            { text: 'Abort & Cancellation', link: '/guide/advanced/abort' },
          ]
        },
        {
          text: '📚 Reference',
          items: [
            { text: 'Migration Guide', link: '/guide/migration' },
            { text: 'FAQ', link: '/guide/faq' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'Changelog', link: '/changelog' },
          ]
        }
      ],

      '/api/': [
        {
          text: '📦 Functions',
          items: [
            { text: 'verifyLink()', link: '/api/verify-link' },
            { text: 'verifyLinks()', link: '/api/verify-links' },
            { text: 'extractUrls()', link: '/api/extract-urls' },
            { text: 'normalizeUrl()', link: '/api/normalize-url' },
          ]
        },
        {
          text: '🏛 Classes',
          items: [
            { text: 'SafeLinkChecker', link: '/api/safe-link-checker' },
            { text: 'CloudGateway', link: '/api/cloud-gateway' },
          ]
        },
        {
          text: '📐 Types',
          items: [
            { text: 'VerificationResult', link: '/api/types/verification-result' },
            { text: 'CheckerOptions', link: '/api/types/checker-options' },
            { text: 'VerifyOptions', link: '/api/types/verify-options' },
            { text: 'VerificationPlugin', link: '/api/types/verification-plugin' },
            { text: 'Provider', link: '/api/types/provider' },
            { text: 'CheckResult', link: '/api/types/check-result' },
            { text: 'PickledResult', link: '/api/types/pickled-result' },
          ]
        },
        {
          text: '⚠️ Errors',
          items: [
            { text: 'SafeLinkError', link: '/api/errors/safe-link-error' },
            { text: 'TimeoutError', link: '/api/errors/timeout-error' },
          ]
        }
      ],

      '/examples/': [
        {
          text: '⚡ Examples',
          items: [
            { text: 'Node.js', link: '/examples/node' },
            { text: 'React', link: '/examples/react' },
            { text: 'React Native', link: '/examples/react-native' },
            { text: 'Expo', link: '/examples/expo' },
            { text: 'Next.js', link: '/examples/nextjs' },
            { text: 'Express', link: '/examples/express' },
            { text: 'Fastify', link: '/examples/fastify' },
            { text: 'NestJS', link: '/examples/nestjs' },
            { text: 'Cloudflare Workers', link: '/examples/cloudflare' },
            { text: 'Bun', link: '/examples/bun' },
            { text: 'Deno', link: '/examples/deno' },
            { text: 'Electron', link: '/examples/electron' },
            { text: 'Messaging App', link: '/examples/messaging' },
            { text: 'Chat Application', link: '/examples/chat' },
            { text: 'Browser Extension', link: '/examples/browser-extension' },
            { text: 'CLI Tool', link: '/examples/cli' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Rajeev766/safe-link-checker' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/safe-link-checker' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Rajeev Choudhary'
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/Rajeev766/safe-link-checker/edit/main/apps/docs/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: { dateStyle: 'short' }
    },
  },

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: true,
  },
})
