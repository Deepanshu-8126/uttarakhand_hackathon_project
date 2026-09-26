import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  },
  server: {
    host: true, // Listen on all local IPs (0.0.0.0) for phone/USB testing
    port: 5173,
  },
})
