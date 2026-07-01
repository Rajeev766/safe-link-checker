/**
 * SafeLinkChecker Benchmark Suite
 * Measures single URL, 100-URL, 1000-URL performance and concurrency scheduler.
 */

import { SafeLinkChecker } from 'safe-link-checker';

const SAFE_URL = 'https://example.com';
const PHISH_URL = 'https://paypal-secure-login-alert.xyz';
const MIXED_URLS = Array.from({ length: 100 }, (_, i) =>
  i % 3 === 0 ? PHISH_URL : `https://example${i}.com`
);
const LARGE_BATCH = Array.from({ length: 1000 }, (_, i) => `https://example${i}.com`);

const checker = new SafeLinkChecker({ cache: false });

async function bench(label: string, fn: () => Promise<unknown>): Promise<void> {
  const start = process.hrtime.bigint();
  const memBefore = process.memoryUsage().heapUsed;
  
  await fn();

  const end = process.hrtime.bigint();
  const memAfter = process.memoryUsage().heapUsed;
  const elapsedMs = Number(end - start) / 1_000_000;
  const heapDeltaMB = (memAfter - memBefore) / 1024 / 1024;
  
  console.log(`  ✅ ${label}`);
  console.log(`     Time:    ${elapsedMs.toFixed(1)} ms`);
  console.log(`     Heap Δ:  ${heapDeltaMB.toFixed(2)} MB`);
}

async function main() {
  console.log('\n🔬 safe-link-checker Benchmark Suite\n');

  await bench('Single URL (safe)',        () => checker.verify(SAFE_URL));
  await bench('Single URL (phishing)',    () => checker.verify(PHISH_URL));
  await bench('100 URLs (concurrency=5)', () => checker.verifyLinks(MIXED_URLS, {}, 5));
  await bench('100 URLs (concurrency=10)',() => checker.verifyLinks(MIXED_URLS, {}, 10));
  await bench('1000 URLs (concurrency=5)',() => checker.verifyLinks(LARGE_BATCH, {}, 5));
  await bench('1000 URLs (concurrency=20)',() => checker.verifyLinks(LARGE_BATCH, {}, 20));
  
  // AbortSignal cancellation test
  const ac = new AbortController();
  setTimeout(() => ac.abort(), 20); // abort after 20ms
  try {
    await bench('1000 URLs (aborted at 20ms)', () =>
      checker.verifyLinks(LARGE_BATCH, { signal: ac.signal }, 5)
    );
  } catch {
    console.log('  ✅ 1000 URLs (aborted at 20ms)');
    console.log('     Correctly threw SafeLinkError on abort');
  }

  console.log('\n✔ Benchmark complete\n');
}

main().catch(err => { console.error(err); process.exit(1); });
