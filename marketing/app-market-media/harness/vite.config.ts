// Renders the app's real dashboard page, site plugin and settings panel outside Wix,
// with the Wix runtime modules swapped for local stand-ins (see ./mocks).
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: here,
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@wix\/essentials$/, replacement: resolve(here, 'mocks/essentials.ts') },
      { find: /^@wix\/site-window$/, replacement: resolve(here, 'mocks/site-window.ts') },
      { find: /^@wix\/editor$/, replacement: resolve(here, 'mocks/editor.ts') },
    ],
  },
  build: {
    outDir: resolve(here, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        dashboard: resolve(here, 'dashboard.html'),
        plugin: resolve(here, 'plugin.html'),
        panel: resolve(here, 'panel.html'),
        mobile: resolve(here, 'mobile.html'),
      },
    },
  },
});
