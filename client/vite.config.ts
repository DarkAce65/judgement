import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

export default defineConfig(({ mode }) => ({
  server: { host: true, port: 3000, strictPort: true },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // antd customization
          '@font-size-base': '16px',
          '@line-height-base': 1.5,
        },
      },
    },
  },
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
