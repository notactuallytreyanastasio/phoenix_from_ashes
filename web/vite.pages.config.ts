import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Config for building to docs/demo/ for GitHub Pages
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path for GitHub Pages - phoenix_from_ashes
  base: '/phoenix_from_ashes/',
  build: {
    outDir: '../docs',
    emptyDir: false, // Don't delete graph-data.json
    sourcemap: false,
  },
})
