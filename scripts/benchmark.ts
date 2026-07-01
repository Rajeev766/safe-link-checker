import { verifyLink } from '../packages/safe-link-checker/src/index.js';
import { URLHausProvider, OpenPhishProvider } from '@safe-link-checker/providers';

async function runBenchmark() {
  console.log('🚀 Running safe-link-checker performance benchmarks...\n');

  const urlsToTest = [
    'https://google.com',
    'https://github.com',
    'http://malicious.com/phishing',
    'http://example.com/login'
  ];

  const iterations = 100;
  
  console.log(`Testing latency for ${iterations} iterations of ${urlsToTest.length} URLs...\n`);
  
  // Warm up
  for (const url of urlsToTest) {
    await verifyLink(url, { providers: [new URLHausProvider(), new OpenPhishProvider()] });
  }

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    for (const url of urlsToTest) {
      await verifyLink(url, { providers: [new URLHausProvider(), new OpenPhishProvider()] });
    }
  }

  const end = performance.now();
  const totalMs = end - start;
  const avgMsPerUrl = totalMs / (iterations * urlsToTest.length);

  console.log(`⏱️ Total Time: ${totalMs.toFixed(2)} ms`);
  console.log(`⏱️ Average Latency: ${avgMsPerUrl.toFixed(2)} ms per verification`);

  if (avgMsPerUrl > 50) {
    console.warn('\n⚠️ WARNING: Average latency is high (> 50ms)');
    process.exit(1);
  } else {
    console.log('\n✅ Performance is within acceptable limits (< 50ms per URL).');
  }
}

runBenchmark().catch(console.error);
