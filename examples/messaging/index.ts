import { extractUrls, verifyLinks } from 'safe-link-checker';

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
      reason: `Message contains ${blocked.length} dangerous link(s).`
    };
  }

  if (warned.length > 0) {
    return {
      action: 'WARN',
      reason: `Message contains ${warned.length} suspicious link(s).`,
      text: text + '\n\n⚠️ Warning: Some links in this message may be unsafe.'
    };
  }

  return { action: 'SEND', text };
}

// Example usage
const msg = "Check this out: https://google.com and http://phishing-site.com";
processMessage(msg).then(console.log);
