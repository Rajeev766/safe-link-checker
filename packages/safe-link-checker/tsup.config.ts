import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'node18',
  banner: ({ entry }) => {
    if (entry === 'cli') {
      return {
        js: '#!/usr/bin/env node',
      };
    }
    return {};
  },
});
