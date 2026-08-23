import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const reactDir = path.dirname(require.resolve('react/package.json'))
const reactDomDir = path.dirname(require.resolve('react-dom/package.json'))

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^react$/, replacement: path.join(reactDir, 'umd/react.production.min.js') },
      { find: /^react-dom$/, replacement: path.join(reactDomDir, 'umd/react-dom.production.min.js') },
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      ignoreTryCatch: false,
    },
    rollupOptions: {
      external: () => false,
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