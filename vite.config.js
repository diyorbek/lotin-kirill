// vite.config.js
import typescript from '@rollup/plugin-typescript';
import multiInput from 'rollup-plugin-multi-input';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: ['./src/**.ts'],
      output: [
        {
          dir: 'pkg',
          inlineDynamicImports: false,
        },
      ],
      plugins: [
        multiInput(),
        typescript({
          outDir: 'pkg/dist-types',
        }),
      ],
    },
    minify: false,
    lib: {
      entry: './src/index.ts',
      fileName: (_, entryName) => `dist-src/${entryName}.js`,
    },
  },
});
