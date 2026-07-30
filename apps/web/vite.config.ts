/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() || 'https://dev-hub.storymee.com'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          // The browser only talks to the StoryMee gateway.
          // Default to the deployed dev Hub because a stale local Hub binary may
          // not expose the consumer-facing /api/v1 alias yet.
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 700,
      assetsInlineLimit: 4096, // inline SVGs < 4 KB, don't inline images
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase/')) {
              return 'vendor-firebase'
            }
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router/')
            ) {
              return 'vendor-react'
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons'
            }
            if (id.includes('node_modules/zustand/')) {
              return 'vendor-state'
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      env: {
        VITE_API_URL: 'https://dev-hub.storymee.com',
      },
    },
  }
})
