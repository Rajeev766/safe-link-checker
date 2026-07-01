import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packages = [
  'core',
  'types',
  'shared',
  'plugins',
  'providers',
  'cache',
  'browser-runtime',
  'node-runtime',
  'edge-runtime'
];

for (const pkg of packages) {
  const pkgDir = path.join(__dirname, pkg);
  const srcDir = path.join(pkgDir, 'src');
  
  if (!fs.existsSync(pkgDir)) {
    fs.mkdirSync(pkgDir, { recursive: true });
  }
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const packageJson = {
    name: `@safe-link-checker/${pkg}`,
    version: '1.0.0',
    private: true,
    main: 'src/index.ts',
    types: 'src/index.ts',
    dependencies: {},
    devDependencies: {}
  };

  // Add some default inter-dependencies
  if (pkg !== 'types' && pkg !== 'shared') {
    packageJson.dependencies['@safe-link-checker/types'] = '*';
  }
  if (pkg === 'core' || pkg === 'plugins' || pkg === 'providers' || pkg.endsWith('-runtime')) {
    packageJson.dependencies['@safe-link-checker/shared'] = '*';
  }
  if (pkg.endsWith('-runtime') || pkg === 'plugins' || pkg === 'providers') {
    packageJson.dependencies['@safe-link-checker/core'] = '*';
  }

  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create an empty index.ts
  fs.writeFileSync(path.join(srcDir, 'index.ts'), '// Entry point\n');
}

console.log('Scaffolding complete.');
