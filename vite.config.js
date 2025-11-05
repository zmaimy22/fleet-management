import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fleet-management/',
  server: {
    port: 3000,
    host: true, // Allow access from network (for mobile testing)
    strictPort: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Optimize for mobile
    minify: 'terser',
    target: 'es2015',
    cssCodeSplit: true
  }
})
