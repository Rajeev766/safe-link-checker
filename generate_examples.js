import fs from 'fs';
import path from 'path';

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

const examples = {
  // Picklers/Messaging example
  'messaging/package.json': `{
  "name": "messaging-example",
  "private": true,
  "type": "module",
  "dependencies": {
    "safe-link-checker": "workspace:*"
  }
}`,
  'messaging/index.ts': `import { extractUrls, verifyLinks } from 'safe-link-checker';

async function processMessage(text: string) {
  const urls = extractUrls(text);
  if (urls.length === 0) return { action: 'SEND', text };

  // Verify all URLs in parallel with bounded concurrency
  const results = await verifyLinks(urls, { timeout: 3000 }, 5);
  
  const blocked = results.filter(r => r.decision === 'BLOCK' || r.decision === 'ESCALATE');
  const warned = results.filter(r => r.decision === 'WARN');

  if (blocked.length > 0) {
    return {
      action: 'BLOCK',
      reason: \`Message contains \${blocked.length} dangerous link(s).\`
    };
  }

  if (warned.length > 0) {
    return {
      action: 'WARN',
      reason: \`Message contains \${warned.length} suspicious link(s).\`,
      text: text + '\\n\\n⚠️ Warning: Some links in this message may be unsafe.'
    };
  }

  return { action: 'SEND', text };
}

// Example usage
const msg = "Check this out: https://google.com and http://phishing-site.com";
processMessage(msg).then(console.log);
`,

  // Node backend
  'node-fastify/package.json': `{
  "name": "fastify-example",
  "private": true,
  "type": "module",
  "dependencies": {
    "safe-link-checker": "workspace:*",
    "fastify": "^4.0.0"
  }
}`,
  'node-fastify/index.ts': `import Fastify from 'fastify';
import { SafeLinkChecker } from 'safe-link-checker';

const app = Fastify({ logger: true });
const checker = new SafeLinkChecker({
  providers: ['urlhaus', 'openphish'],
  policy: 'strict',
  cache: true
});

app.post('/verify', async (request, reply) => {
  const { url } = request.body as { url: string };
  if (!url) return reply.code(400).send({ error: 'url is required' });
  
  const result = await checker.verify(url);
  return result;
});

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
`,

  // Frontend React
  'react-frontend/package.json': `{
  "name": "react-example",
  "private": true,
  "dependencies": {
    "safe-link-checker": "workspace:*",
    "react": "^18.0.0"
  }
}`,
  'react-frontend/LinkInput.tsx': `import React, { useState } from 'react';
import { verifyLink } from 'safe-link-checker';

export function LinkInput() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<string>('');

  const check = async (val: string) => {
    setUrl(val);
    if (!val.startsWith('http')) {
      setStatus('');
      return;
    }
    setStatus('Checking...');
    try {
      const result = await verifyLink(val);
      setStatus(\`Score: \${result.trustScore}/100 - \${result.decision}\`);
    } catch (e) {
      setStatus('Error checking link');
    }
  };

  return (
    <div>
      <input 
        type="url" 
        value={url} 
        onChange={(e) => check(e.target.value)} 
        placeholder="Enter URL..." 
      />
      <div>{status}</div>
    </div>
  );
}
`,

  // React Native
  'react-native/package.json': `{
  "name": "rn-example",
  "private": true,
  "dependencies": {
    "safe-link-checker": "workspace:*",
    "react-native": "*"
  }
}`,
  'react-native/SafeLink.ts': `import { Linking, Alert } from 'react-native';
import { verifyLink } from 'safe-link-checker';

export async function openSafeUrl(url: string) {
  try {
    const result = await verifyLink(url);

    if (result.decision === 'BLOCK') {
      Alert.alert(
        'Dangerous Link Blocked',
        result.summary || 'This link has been blocked for your safety.'
      );
      return false;
    }

    if (result.decision === 'WARN') {
      return new Promise((resolve) => {
        Alert.alert(
          'Suspicious Link',
          result.summary || 'This link looks suspicious. Are you sure you want to proceed?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Open Anyway', style: 'destructive', onPress: () => {
              Linking.openURL(result.normalizedUrl);
              resolve(true);
            }}
          ]
        );
      });
    }

    await Linking.openURL(result.normalizedUrl);
    return true;
  } catch (error) {
    console.error('Failed to verify or open URL:', error);
    return false;
  }
}
`,

  // Cloudflare Workers
  'cloudflare-worker/package.json': `{
  "name": "worker-example",
  "private": true,
  "dependencies": {
    "safe-link-checker": "workspace:*"
  }
}`,
  'cloudflare-worker/index.ts': `import { verifyLink } from 'safe-link-checker';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { url } = await request.json();
      if (!url) return new Response('Missing url', { status: 400 });

      // Runs the Edge implementation of safe-link-checker automatically
      const result = await verifyLink(url);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e: any) {
      return new Response(e.message, { status: 500 });
    }
  }
};
`
};

Object.entries(examples).forEach(([relPath, content]) => {
  const fullPath = path.join(EXAMPLES_DIR, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created ' + relPath);
});
