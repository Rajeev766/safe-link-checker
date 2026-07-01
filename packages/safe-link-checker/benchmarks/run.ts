import { SafeLinkChecker } from '../src/checker.js';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import os from 'os';

async function runBenchmarks() {
  console.log('--- Benchmarking SafeLinkChecker ---');
  console.log(`OS: ${os.platform()} ${os.arch()}`);
  console.log(`Node: ${process.version}\n`);

  // 1. Startup Time
  const startInit = performance.now();
  const checker = new SafeLinkChecker();
  const endInit = performance.now();
  console.log(`[+] Startup & Initialization: ${(endInit - startInit).toFixed(2)} ms`);

  // 2. Single URL Verification (Cold)
  const coldUrl = 'https://example.com';
  const startSingle = performance.now();
  await checker.verify(coldUrl);
  const endSingle = performance.now();
  console.log(`[+] Single URL Verification (Cold Network): ${(endSingle - startSingle).toFixed(2)} ms`);

  // 3. Cache Hit Performance
  const startCache = performance.now();
  await checker.verify(coldUrl);
  const endCache = performance.now();
  console.log(`[+] Single URL Verification (Cache Hit): ${(endCache - startCache).toFixed(2)} ms`);

  // 4. Batch Verification (Memory & CPU Tracking)
  // Generate dummy URLs (that won't hit network due to invalid TLDs or localhost catching)
  const batch10 = Array.from({ length: 10 }).map((_, i) => `http://invalid-tld-${i}.local`);
  const batch100 = Array.from({ length: 100 }).map((_, i) => `http://invalid-tld-${i}.local`);
  const batch1000 = Array.from({ length: 1000 }).map((_, i) => `http://invalid-tld-${i}.local`);

  const runBatch = async (urls: string[], name: string) => {
    const memBefore = process.memoryUsage().heapUsed;
    const cpuBefore = process.cpuUsage();
    const start = performance.now();
    
    await checker.verifyLinks(urls);
    
    const end = performance.now();
    const cpuAfter = process.cpuUsage(cpuBefore);
    const memAfter = process.memoryUsage().heapUsed;
    
    const timeMs = (end - start).toFixed(2);
    const cpuMs = ((cpuAfter.user + cpuAfter.system) / 1000).toFixed(2);
    const memSpikeMb = Math.max(0, (memAfter - memBefore) / 1024 / 1024).toFixed(2);
    
    console.log(`[+] Batch ${name}: ${timeMs} ms (CPU Time: ${cpuMs} ms, Mem Spike: ${memSpikeMb} MB)`);
  };

  await runBatch(batch10, '10 URLs');
  await runBatch(batch100, '100 URLs');
  await runBatch(batch1000, '1000 URLs');

  // 5. Bundle Size Measurement
  console.log('\n--- Bundle Sizes ---');
  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    let totalSize = 0;
    const files = fs.readdirSync(distDir);
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.cjs')) {
        const stat = fs.statSync(path.join(distDir, file));
        totalSize += stat.size;
        console.log(`[+] ${file}: ${(stat.size / 1024).toFixed(2)} KB`);
      }
    }
    console.log(`[=>] Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
  } else {
    console.log('[-] dist directory not found (run `npm run build` first).');
  }
}

runBenchmarks().catch(console.error);
