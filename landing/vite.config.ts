import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The landing is its own SPA (own entry, own build, own deploy) that borrows the app's code through "@/":
// the particle shaders, the timer state machine and the Web Audio engine are the real ones, not copies.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // The app's public folder: the ambient recordings, the chime and the favicon are served from the same place.
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5174 },
  preview: { port: 4174 },
  build: {
    outDir: fileURLToPath(new URL('../dist-landing', import.meta.url)),
    emptyOutDir: true,
    // three.js is the one big chunk, loaded after the first paint.
    chunkSizeWarningLimit: 600,
  },
})
