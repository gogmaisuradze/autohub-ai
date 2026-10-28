import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/autohub-ai/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      '/api/v1': {
        target: process.env.MAP_API_PROXY_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true
      },
      '/health': {
        target: process.env.MAP_API_PROXY_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      '/api/v1': {
        target: process.env.MAP_API_PROXY_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true
      },
      '/health': {
        target: process.env.MAP_API_PROXY_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['react', 'react-dom', 'lucide-react', 'framer-motion']
        }
      }
    }
  }
});
