import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { dependencies } = JSON.parse(readFileSync('package.json', 'utf8'));

const ENTRIES = { index: 'src/index.ts', exceptions: 'src/exceptions.ts' };

// `vite build` makes the npm builds (ESM and CommonJS) of both entries and
// leaves dependencies to the package manager. `vite build --mode umd` makes the
// <script> bundle for unpkg and jsDelivr, with dependencies included, and
// `--mode umd-exceptions` the one for the list of exceptions. UMD takes one
// entry per build; both add their exports to the global `lotinKirill`.
export default defineConfig(({ mode }) => {
  const umd = mode.startsWith('umd');
  const umdEntry = mode === 'umd-exceptions' ? 'exceptions' : 'index';

  return {
    build: {
      lib: {
        entry: umd ? ENTRIES[umdEntry] : ENTRIES,
        name: 'lotinKirill',
        formats: umd ? ['umd'] : ['es', 'cjs'],
        fileName: (format, entryName) =>
          format === 'umd'
            ? `${umdEntry}.umd.js`
            : format === 'cjs'
              ? `${entryName}.cjs`
              : `${entryName}.js`,
      },
      emptyOutDir: !umd,
      rolldownOptions: {
        external: umd ? [] : Object.keys(dependencies),
        output: { exports: 'named', extend: true },
      },
    },
    test: {
      globals: true,
      include: ['tests/**/*.spec.ts'],
      coverage: { include: ['src/**'], reporter: ['text', 'lcov'] },
    },
  };
});
