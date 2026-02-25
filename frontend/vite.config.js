import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // allow external access
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: true,  // THIS is critical (boolean true, not 'all')
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
