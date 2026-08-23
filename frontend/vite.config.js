import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Force Rollup to bundle react instead of externalizing it as CJS.
    // Without this, Vercel's build container produces an externalized
    // reference to "./cjs/react.production.min.js?commonjs-external"
    // which then fails to resolve itself.
    commonjsOptions: {
      transformMixedEsModules: true,
      ignoreTryCatch: false,
    },
    rollupOptions: {
      external: [],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5126',
        changeOrigin: true,
      },
    },
  },
})
