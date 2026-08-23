import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure only one copy of React is bundled — prevents
    // "./cjs/react.production.min.js" resolution failures on Vercel.
    dedupe: ['react', 'react-dom'],
    alias: [
      // Map the bare `react` and `react-dom` specifiers to their
      // ESM entry points. This bypasses Rollup's CJS resolution
      // path that fails on some Vercel/Node combinations.
      {
        find: /^react$/,
        replacement: 'react/index.js',
      },
      {
        find: /^react-dom$/,
        replacement: 'react-dom/index.js',
      },
      {
        find: /^react-dom\/client$/,
        replacement: 'react-dom/client.js',
      },
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
    force: true,
  },
  build: {
    commonjsOptions: {
      include: [/.+/],
      transformMixedEsModules: true,
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
