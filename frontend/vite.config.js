import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force CJS -> ESM resolution for react in production builds.
      // Some Vercel/Node combinations fail to resolve react's internal
      // CJS path ("react/cjs/react.production.min.js") when bundling for
      // production. The string `false` tells Vite to use the ESM build
      // instead.
      'react/jsx-runtime': 'react/jsx-runtime',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
  },
  build: {
    commonjsOptions: {
      include: [/.+/],
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
