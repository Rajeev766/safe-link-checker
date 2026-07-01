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
    pkgJson.exports = {
      ".": "./src/index.ts",
      "./*": "./src/*"
    };
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
    console.log(`Added exports to ${pkg}/package.json`);
  }
}
