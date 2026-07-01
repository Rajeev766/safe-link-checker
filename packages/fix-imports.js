import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagesDir = __dirname;
const packages = fs.readdirSync(packagesDir).filter(p => fs.statSync(path.join(packagesDir, p)).isDirectory());

function fixImportsInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImportsInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const originalContent = content;

      // Replace paths like ../../types/index.js -> @safe-link-checker/types
      content = content.replace(/['"](\.\.\/)+types(\/index(\.js)?)?['"]/g, "'@safe-link-checker/types'");
      content = content.replace(/['"](\.\.\/)+core(\/index(\.js)?)?['"]/g, "'@safe-link-checker/core'");
      content = content.replace(/['"](\.\.\/)+shared(\/index(\.js)?)?['"]/g, "'@safe-link-checker/shared'");
      
      // For cache, plugins, providers, we might be importing submodules or the index.
      // But actually, we should just import the whole package if possible, or use exports map.
      // Let's just catch anything going into those directories.
      content = content.replace(/['"](\.\.\/)+plugins(\/.*?(\.js)?)?['"]/g, (match, p1, p2) => {
        return `'@safe-link-checker/plugins${p2 ? p2 : ''}'`;
      });
      content = content.replace(/['"](\.\.\/)+providers(\/.*?(\.js)?)?['"]/g, (match, p1, p2) => {
        return `'@safe-link-checker/providers${p2 ? p2 : ''}'`;
      });
      content = content.replace(/['"](\.\.\/)+cache(\/.*?(\.js)?)?['"]/g, (match, p1, p2) => {
        return `'@safe-link-checker/cache${p2 ? p2 : ''}'`;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

for (const pkg of packages) {
  if (pkg === 'safe-link-checker' || pkg.startsWith('safe-link-checker-')) continue;
  fixImportsInDir(path.join(packagesDir, pkg, 'src'));
}
