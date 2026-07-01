import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

const packageJsonPath = path.join(ROOT_DIR, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add prepare script for Husky
if (!pkg.scripts) pkg.scripts = {};
pkg.scripts.prepare = 'husky';

// Add size-limit
pkg['size-limit'] = [
  {
    path: 'packages/safe-link-checker/dist/index.js',
    limit: '200 kB',
    name: 'safe-link-checker (Node)'
  },
  {
    path: 'packages/safe-link-checker/dist/browser/index.js',
    limit: '100 kB',
    name: 'safe-link-checker (Browser)'
  }
];

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

// commitlint config
fs.writeFileSync(path.join(ROOT_DIR, 'commitlint.config.js'), `export default { extends: ['@commitlint/config-conventional'] };\n`);

// lint-staged config
fs.writeFileSync(path.join(ROOT_DIR, '.lintstagedrc.json'), JSON.stringify({
  "*.{ts,tsx}": [
    "npm run lint"
  ]
}, null, 2));

console.log('Configured Husky, size-limit, commitlint, lint-staged');
