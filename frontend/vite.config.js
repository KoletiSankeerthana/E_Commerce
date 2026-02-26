import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",   // ADD THIS LINE (CRITICAL FIX)

  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://ecommerce-vwsy.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})