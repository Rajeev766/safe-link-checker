import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, replacer) => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn('File not found: ' + fullPath);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = replacer(content);
  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

// 1. factory.ts
replaceInFile('core/src/core/factory.ts', (content) => {
  content = content.replace(/import \{ BasicUrlValidationPlugin \} from '.*?';/, "import { BasicUrlValidationPlugin } from '@safe-link-checker/plugins';");
  content = content.replace(/import \{ HeuristicsPlugin \} from '.*?';/, "import { HeuristicsPlugin } from '@safe-link-checker/plugins';");
  return content;
});

// Create index.ts for plugins
const pluginsIndex = `
export * from './core/basic.js';
export * from './core/heuristics.js';
export * from './core/redirect.js';
export * from './core/provider.js';
`;
fs.writeFileSync(path.join(__dirname, 'plugins/src/index.ts'), pluginsIndex);

// 2. core index.ts missing cache
replaceInFile('core/src/index.ts', (content) => {
  content = content.replace(/from '\.\/cache\//g, "from '@safe-link-checker/cache/");
  return content;
});

// 3. node-runtime checker.ts missing providers and plugins
replaceInFile('node-runtime/src/checker.ts', (content) => {
  content = content.replace(/from '\.\/providers\//g, "from '@safe-link-checker/providers/");
  content = content.replace(/from '\.\/plugins\//g, "from '@safe-link-checker/plugins/");
  return content;
});

// 4. node-runtime index.ts
replaceInFile('node-runtime/src/index.ts', (content) => {
  content = content.replace(/from '\.\/providers\//g, "from '@safe-link-checker/providers/");
  return content;
});

// Create index.ts for providers
const providersIndex = `
export * from './openphish.js';
export * from './urlhaus.js';
`;
fs.writeFileSync(path.join(__dirname, 'providers/src/index.ts'), providersIndex);

// Fix node-runtime checker to import from provider index
replaceInFile('node-runtime/src/checker.ts', (content) => {
  content = content.replace(/from '@safe-link-checker\/providers\/openphish\.js'/g, "from '@safe-link-checker/providers'");
  content = content.replace(/from '@safe-link-checker\/providers\/urlhaus\.js'/g, "from '@safe-link-checker/providers'");
  content = content.replace(/from '@safe-link-checker\/plugins\/core\/provider\.js'/g, "from '@safe-link-checker/plugins'");
  content = content.replace(/from '@safe-link-checker\/plugins\/core\/redirect\.js'/g, "from '@safe-link-checker/plugins'");
  return content;
});

replaceInFile('node-runtime/src/index.ts', (content) => {
  content = content.replace(/from '@safe-link-checker\/providers\/openphish\.js'/g, "from '@safe-link-checker/providers'");
  content = content.replace(/from '@safe-link-checker\/providers\/urlhaus\.js'/g, "from '@safe-link-checker/providers'");
  return content;
});

// 5. https.ts still has safe-link-checker-core
replaceInFile('node-runtime/src/validators/https.ts', (content) => {
  content = content.replace(/from 'safe-link-checker-core'/g, "from '@safe-link-checker/core'");
  return content;
});

// 6. Fix test imports
const fixTests = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixTests(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/['"](\.\.\/)*src\/(node|browser)\//g, (m) => {
        return m.includes('node') ? "'@safe-link-checker/node-runtime/" : "'@safe-link-checker/browser-runtime/";
      });
      content = content.replace(/['"](\.\.\/)*src\/core\//g, "'@safe-link-checker/core/");
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
fixTests(path.join(__dirname, 'safe-link-checker/tests'));
