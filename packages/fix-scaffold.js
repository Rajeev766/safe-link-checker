import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagesDir = __dirname;
const packages = fs.readdirSync(packagesDir).filter(p => fs.statSync(path.join(packagesDir, p)).isDirectory());

for (const pkg of packages) {
  if (pkg === 'safe-link-checker' || pkg.startsWith('safe-link-checker-')) continue;
  
  const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.type = 'module';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
    console.log(`Added type: module to ${pkg}/package.json`);
  }
  
  const fixBrowserImports = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        fixBrowserImports(fullPath);
      } else if (fullPath.endsWith('.ts')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/['"]\.\.\/browser\/index(\.js)?['"]/g, "'@safe-link-checker/browser-runtime'");
        content = content.replace(/['"]\.\.\/core\/index(\.js)?['"]/g, "'@safe-link-checker/core'");
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  };
  fixBrowserImports(path.join(packagesDir, pkg, 'src'));
}
