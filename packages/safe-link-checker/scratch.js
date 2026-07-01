import fs from 'fs';
import path from 'path';

function replaceInDir(dir, findRegex, replaceValue) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, findRegex, replaceValue);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const newContent = content.replace(findRegex, replaceValue);
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.resolve('packages/safe-link-checker/tests/node'), /['"]safe-link-checker-node['"]/g, "'../../src/node/index.js'");
replaceInDir(path.resolve('packages/safe-link-checker/tests/node'), /['"]safe-link-checker-core['"]/g, "'../../src/core/index.js'");
replaceInDir(path.resolve('packages/safe-link-checker/tests/node'), /['"]safe-link-checker-types['"]/g, "'../../src/types/index.js'");

replaceInDir(path.resolve('packages/safe-link-checker/tests/browser'), /['"]safe-link-checker-browser['"]/g, "'../../src/browser/index.js'");
replaceInDir(path.resolve('packages/safe-link-checker/tests/browser'), /['"]safe-link-checker-core['"]/g, "'../../src/core/index.js'");
replaceInDir(path.resolve('packages/safe-link-checker/tests/browser'), /['"]safe-link-checker-types['"]/g, "'../../src/types/index.js'");
