import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.split('\\').join('/');

            if (!normalizedId.includes('/node_modules/')) return undefined;
            if (normalizedId.includes('/react-router-dom/') || normalizedId.includes('/react-router/')) return 'router';
            if (normalizedId.includes('/react-dom/') || normalizedId.includes('/react/') || normalizedId.includes('/scheduler/')) return 'react-vendor';
            if (normalizedId.includes('/laravel-echo/') || normalizedId.includes('/pusher-js/')) return 'realtime';
            if (normalizedId.includes('/hls.js/')) return 'media';
            if (normalizedId.includes('/react-icons/')) return 'icons';

            return 'vendor';
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  };
});