import fs from 'fs';
import path from 'path';

function copyFiles() {
  const nodeDts = path.resolve('dist/node/index.d.ts');
  const nodeDcts = path.resolve('dist/node/index.d.cts');
  
  if (!fs.existsSync(nodeDts) || !fs.existsSync(nodeDcts)) {
    throw new Error('Node type declarations not found. Build may have failed.');
  }

  const targets = [
    { dir: 'browser', ext: '.d.ts', src: nodeDts },
    { dir: 'browser', ext: '.d.cts', src: nodeDcts },
    { dir: 'edge', ext: '.d.ts', src: nodeDts },
    { dir: 'edge', ext: '.d.cts', src: nodeDcts },
  ];

  targets.forEach(({ dir, ext, src }) => {
    const dest = path.resolve(`dist/${dir}/index${ext}`);
    fs.copyFileSync(src, dest);
    console.log(`Copied ${path.basename(src)} to ${dir}/index${ext}`);
  });
}

copyFiles();
