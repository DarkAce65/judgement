import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

export default defineConfig(({ mode }) => ({
  server: { host: true, port: 3000, strictPort: true },
  plugins: [
    react(),
    checker({
      overlay: { initialIsOpen: false },
      terminal: mode !== 'test',
      typescript: true,
      eslint: { lintCommand: "eslint './src/**/*.{ts,tsx}'" },
    }),
  ],
}));
