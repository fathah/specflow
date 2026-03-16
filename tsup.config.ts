import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'es2020',
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  external: [],
});
