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
      // Tambahkan ini agar domain Ngrok tidak diblokir oleh Vite
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],

      // Disable HMR and WebSocket server entirely
      hmr: false,
      ws: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // In production API calls hit the exact same domain so proxy isn't strictly needed 
      // when Vite is mounted as middleware in Express, but kept here for standard Vite preview.
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Paksa ke port 3000
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:3000', // Paksa ke port 3000
          changeOrigin: true,
          secure: false,
        }
      },  
    },
    build: {
      outDir: 'dist',
    },
  };
});