import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'https://nasa-explorer-l5v6.onrender.com', changeOrigin: true } }
  },
  build: { outDir: '../server/build', emptyOutDir: true }
})
