import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure only one copy of React is bundled — prevents
    // duplicate-React and CJS resolution failures on Vercel.
    dedupe: ['react', 'react-dom'],
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
