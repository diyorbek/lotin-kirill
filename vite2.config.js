// vite.config.js
import fs from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: ['./src/index.ts'],
      output: [
        {
          dir: 'pkg',
          inlineDynamicImports: false,
          format: 'umd',
          name: 'lotinKirill',
          plugins: [
            {
              generateBundle() {
                fs.copyFileSync(
                  resolve(__dirname, 'package.json'),
                  resolve(__dirname, 'pkg/package.json'),
                );

                fs.copyFileSync(
                  resolve(__dirname, 'README.md'),
                  resolve(__dirname, 'pkg/README.md'),
                );

                fs.copyFileSync(
                  resolve(__dirname, 'LICENSE'),
                  resolve(__dirname, 'pkg/LICENSE'),
                );

                const packageJsonPath = resolve(__dirname, 'pkg/package.json');
                const packageJson = JSON.parse(
                  fs.readFileSync(packageJsonPath, 'utf-8'),
                );

                delete packageJson.scripts;

                fs.writeFileSync(
                  packageJsonPath,
                  JSON.stringify(packageJson, null, 2),
                );
              },
            },
          ],
        },
      ],
    },
    minify: true,
    outDir: 'pkg',
    emptyOutDir: false,
    lib: {
      entry: './src/index.ts',
      fileName: (_, entryName) => `dist-umd/${entryName}.min.js`,
    },
  },
});
