/// <reference types="vitest" />
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss(), splitVendorChunkPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Keep local dev traffic on the Node API. On Windows, `localhost` may
        // resolve to ::1 and hit the Docker-published API instead.
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 700,
    assetsInlineLimit: 4096, // inline SVGs < 4 KB, don't inline images
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always cached
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase — heavy but stable
          'vendor-supabase': ['@supabase/supabase-js'],
          // Firebase — heavy, separate chunk
          'vendor-firebase': ['firebase'],
          // Framer Motion — animation library
          'vendor-motion': ['framer-motion'],
          // Lucide icons — tree-shaken but still sizeable
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})

