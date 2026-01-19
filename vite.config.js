import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    strictPort: false, // Automatically try next port if occupied
    host: true // Expose to all network interfaces
  },
  build: {
    cssCodeSplit: false, // Bundle all CSS together for faster loading
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'primereact': ['primereact'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
})
