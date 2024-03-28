// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      input: ['./src/index.ts'],
      output: [
        {
          dir: 'pkg',
          inlineDynamicImports: false,
        },
      ],
    },
    minify: false,
    emptyOutDir: false,
    outDir: 'pkg',
    lib: {
      entry: './src/index.ts',
      fileName: (_, entryName) => `dist-node/${entryName}.js`,
    },
  },
});
