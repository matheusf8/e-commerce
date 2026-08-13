import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    // sem isso, o vitest tenta coletar os specs do Playwright em e2e/
    // (que usam test.describe do @playwright/test, não do vitest) e quebra
    exclude: ['e2e/**', 'node_modules/**'],
    // ainda não há testes unitários (só e2e via Playwright) — não falhar por isso
    passWithNoTests: true,
  },
})
