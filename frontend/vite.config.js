import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // No optimizeDeps.include — forcing pre-bundling on Vercel was making
  // Vite resolve into the CJS `./cjs/react-jsx-runtime.production.min.js`
  // path that doesn't exist in some build environments.
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
