import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'apps/web/src'),
    },
  },
  test: {
    environment: 'jsdom',
    env: {
      VITE_API_URL: 'https://dev-hub.storymee.com',
    },
  },
})
