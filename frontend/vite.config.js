import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // In production we want axios to hit the same origin so Vercel can
  // proxy /api/* to Railway. Pull from the env file but fall back to
  // /api so a missing or stale .env.production never re-introduces a
  // hard-coded cross-origin URL.
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || (mode === 'production' ? '/api' : '/api')

  return {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    plugins: [react({ jsxRuntime: 'classic' })],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        ignoreTryCatch: false,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
        output: {
          format: 'iife',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
            'react/jsx-dev-runtime': 'jsxDevRuntime',
          },
          inlineDynamicImports: true,
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5126',
          changeOrigin: true,
        },
        // Proxy /uploads/* so the backend-served images load in dev.
        // In production (Vercel) the same-origin static handler takes over.
        '/uploads': {
          target: 'http://localhost:5126',
          changeOrigin: true,
        },
      },
    },
  }
})