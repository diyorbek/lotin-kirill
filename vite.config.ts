import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { dependencies } = JSON.parse(readFileSync('package.json', 'utf8'));

// `vite build` makes the npm builds (ESM and CommonJS) and leaves dependencies
// to the package manager. `vite build --mode umd` makes the <script> bundle for
// unpkg and jsDelivr, with dependencies included.
export default defineConfig(({ mode }) => {
  const umd = mode === 'umd';

  return {
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'lotinKirill',
        formats: umd ? ['umd'] : ['es', 'cjs'],
        fileName: (format) =>
          ({ es: 'index.js', cjs: 'index.cjs', umd: 'index.umd.js' }[format]),
      },
      emptyOutDir: !umd,
      rolldownOptions: {
        external: umd ? [] : Object.keys(dependencies),
        output: { exports: 'named' },
      },
    },
    test: {
      globals: true,
      include: ['__tests__/**/*.spec.ts'],
      coverage: { include: ['src/**'], reporter: ['text', 'lcov'] },
    },
  };
});
