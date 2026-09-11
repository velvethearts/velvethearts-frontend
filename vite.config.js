import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components/ui': path.resolve(__dirname, './src/components/UI'),
      '@': path.resolve(__dirname, './src'),
    }
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@phosphor-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('socket.io-client') || id.includes('axios') || id.includes('canvas-confetti')) {
              return 'vendor-utils';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
})
