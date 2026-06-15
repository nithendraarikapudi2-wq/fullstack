import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/fullstack/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true
      }
    }
  }
});
