import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ms1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms1/, ''),
      },
      '/api/ms2': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms2/, ''),
      },
      '/api/ms3': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms3/, ''),
      },
      '/api/ms4': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms4/, ''),
      },
      '/api/ms5': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ms5/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
