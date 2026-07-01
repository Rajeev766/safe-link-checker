import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

const VERIFY_SCRIPT = `
import { SafeLinkChecker } from 'safe-link-checker';

async function main() {
  const checker = new SafeLinkChecker();
  const result = await checker.verify('https://example.com');
  if (result.decision !== 'ALLOW') {
    console.error(JSON.stringify(result, null, 2));
    throw new Error('Verification failed, expected ALLOW');
  }
  console.log('Verification success:', result.decision);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
`;

async function runSmokeTests() {
  console.log('🚀 Building and packing safe-link-checker...');
  
  // Build
  execSync('npm run build --workspace=packages/safe-link-checker', { stdio: 'inherit' });
  
  // Pack safe-link-checker package
  const pkgDir = path.resolve('packages/safe-link-checker');
  execSync('npm pack', { cwd: pkgDir, stdio: 'inherit' });
  
  // Find tarball
  const tarballName = fs.readdirSync(pkgDir).find(f => f.endsWith('.tgz'));
  if (!tarballName) throw new Error('Tarball not found');
  const tarballPath = path.resolve(pkgDir, tarballName);
  
  console.log(`📦 Tarball created: ${tarballPath}`);
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slc-smoke-'));
  console.log(`🧪 Running smoke tests in ${tempDir}`);
  
  try {
    // 1. Node ESM
    console.log('==> Testing Node ESM');
    const nodeEsmDir = path.join(tempDir, 'node-esm');
    fs.mkdirSync(nodeEsmDir);
    fs.writeFileSync(path.join(nodeEsmDir, 'package.json'), JSON.stringify({ type: 'module' }));
    execSync(`npm install ${tarballPath}`, { cwd: nodeEsmDir, stdio: 'inherit' });
    fs.writeFileSync(path.join(nodeEsmDir, 'index.js'), VERIFY_SCRIPT);
    execSync('node index.js', { cwd: nodeEsmDir, stdio: 'inherit' });
    
    // 2. Node CJS
    console.log('==> Testing Node CJS');
    const nodeCjsDir = path.join(tempDir, 'node-cjs');
    fs.mkdirSync(nodeCjsDir);
    fs.writeFileSync(path.join(nodeCjsDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));
    execSync(`npm install ${tarballPath}`, { cwd: nodeCjsDir, stdio: 'inherit' });
    const cjsScript = VERIFY_SCRIPT.replace('import { SafeLinkChecker } from', 'const { SafeLinkChecker } = require(').replace(/;/g, ');').replace('require(\'safe-link-checker\');)', 'require(\'safe-link-checker\');'); // simple hack
    const correctCjsScript = `
const { SafeLinkChecker } = require('safe-link-checker');

async function main() {
  const checker = new SafeLinkChecker();
  const result = await checker.verify('https://example.com');
  if (result.decision !== 'ALLOW') {
    console.error(JSON.stringify(result, null, 2));
    throw new Error('Verification failed, expected ALLOW');
  }
  console.log('Verification success:', result.decision);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
`;
    fs.writeFileSync(path.join(nodeCjsDir, 'index.js'), correctCjsScript);
    execSync('node index.js', { cwd: nodeCjsDir, stdio: 'inherit' });

    console.log('✅ All smoke tests passed!');
  } finally {
    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(tarballPath, { force: true });
  }
}

runSmokeTests().catch(e => {
  console.error('❌ Smoke tests failed:', e);
  process.exit(1);
});
