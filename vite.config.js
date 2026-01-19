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
    minify: 'esbuild'
  }
})
