import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function getPackageName(normalizedId) {
  const nodeModulesSegment = '/node_modules/';
  const nodeModulesIndex = normalizedId.lastIndexOf(nodeModulesSegment);

  if (nodeModulesIndex === -1) return null;

  const packagePath = normalizedId.slice(nodeModulesIndex + nodeModulesSegment.length);
  const parts = packagePath.split('/');

  if (parts[0]?.startsWith('@')) {
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
  }

  return parts[0] || null;
}

function toChunkName(packageName) {
  return packageName.replace(/^@/, '').replace(/[^a-zA-Z0-9]+/g, '-');
}

const ignoredStandaloneChunkPackages = new Set(['cookie', 'set-cookie-parser', 'motion']);

const manualChunkNames = {
  'react-router-dom': 'vendor-react-router',
  'react-router': 'vendor-react-router',
  'react-dom': 'vendor-react-core',
  'react': 'vendor-react-core',
  'scheduler': 'vendor-react-core',
  'laravel-echo': 'vendor-realtime-stack',
  'pusher-js': 'vendor-realtime-stack',
  'hls.js': 'vendor-hls-js',
  'react-icons': 'vendor-react-icons',
  'framer-motion': 'vendor-motion-framer',
  'motion-dom': 'vendor-motion-dom',
  'motion-utils': 'vendor-motion-utils',
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 400,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.split('\\').join('/');
            const packageName = getPackageName(normalizedId);

            if (!packageName) return undefined;
            if (ignoredStandaloneChunkPackages.has(packageName)) return undefined;
            if (manualChunkNames[packageName]) return manualChunkNames[packageName];

            return `vendor-${toChunkName(packageName)}`;
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