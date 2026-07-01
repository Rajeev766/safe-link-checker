import { build } from 'tsup';

async function run() {
  await build({
    entry: {
      'node/index': 'src/node/index.ts',
      'browser/index': 'src/browser/index.ts',
      'edge/index': 'src/edge/index.ts'
    },
    format: ['cjs', 'esm'],
    dts: { resolve: true },
    noExternal: [/^@safe-link-checker\//],
    clean: true,
    sourcemap: false,
    treeshake: true,
    minify: true,
    splitting: true,
    target: 'node18',
    outDir: 'dist',
    tsconfig: 'tsconfig.dts.json'
  });
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
