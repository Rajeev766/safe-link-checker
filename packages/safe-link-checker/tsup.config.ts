import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      'node/index': 'src/node/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: { resolve: true },
    noExternal: [/^@safe-link-checker\//],
    clean: true,
    sourcemap: true,
    treeshake: true,
    target: 'node18',
    outDir: 'dist'
  },
  {
    entry: {
      'browser/index': 'src/browser/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: { resolve: true },
    noExternal: [/^@safe-link-checker\//],
    clean: false, // Don't clean twice
    sourcemap: true,
    treeshake: true,
    target: 'esnext',
    outDir: 'dist'
  },
  {
    entry: {
      'edge/index': 'src/edge/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: { resolve: true },
    noExternal: [/^@safe-link-checker\//],
    clean: false, // Don't clean twice
    sourcemap: true,
    treeshake: true,
    target: 'esnext',
    outDir: 'dist'
  }
]);
