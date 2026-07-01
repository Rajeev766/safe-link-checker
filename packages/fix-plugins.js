import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Fix plugins imports
const fixPlugins = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixPlugins(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from '\.\.\/\.\.\/core\/plugin\.js'/g, "from '@safe-link-checker/core'");
      content = content.replace(/from '\.\.\/\.\.\/validators\/(.*?)'/g, "from '@safe-link-checker/core'");
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
fixPlugins(path.join(__dirname, 'plugins/src'));

// 2. Fix https.ts import
const httpsFile = path.join(__dirname, 'node-runtime/src/validators/https.ts');
if (fs.existsSync(httpsFile)) {
  let content = fs.readFileSync(httpsFile, 'utf8');
  content = content.replace(/from 'safe-link-checker-core'/g, "from '@safe-link-checker/core'");
  fs.writeFileSync(httpsFile, content, 'utf8');
}

// 3. Add dependencies to core package.json
const corePkgPath = path.join(__dirname, 'core/package.json');
const corePkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
corePkg.dependencies = corePkg.dependencies || {};
corePkg.dependencies['normalize-url'] = '^8.0.0';
corePkg.dependencies['tldts'] = '^6.1.18';
corePkg.dependencies['ipaddr.js'] = '^2.2.0';
corePkg.dependencies['validator'] = '^13.12.0';
fs.writeFileSync(corePkgPath, JSON.stringify(corePkg, null, 2), 'utf8');

// 4. Also node-runtime needs https/tls dependencies if it had any, but they are built-ins.
