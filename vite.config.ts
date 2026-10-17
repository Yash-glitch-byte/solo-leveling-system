import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-html-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/index.dev.html';
          }
          next();
        });
      }
    }
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: './index.dev.html'
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
