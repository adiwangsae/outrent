import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable HMR and WebSocket server entirely
      hmr: false,
      ws: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // In production API calls hit the exact same domain so proxy isn't strictly needed 
      // when Vite is mounted as middleware in Express, but kept here for standard Vite preview.
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: process.env.VITE_API_URL || 'http://127.0.0.1:3000',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
    },
  };
});
