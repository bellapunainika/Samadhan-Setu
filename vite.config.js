import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'react-vendor': ['react', 'react-dom'],
          // Animation library (heavy)
          'framer-motion': ['framer-motion'],
          // Charts (heavy)
          'recharts': ['recharts'],
          // Icons (medium)
          'lucide': ['lucide-react'],
        }
      }
    },
    // Raise warning threshold to 600kb (individual chunks won't hit this)
    chunkSizeWarningLimit: 600,
  }
})

