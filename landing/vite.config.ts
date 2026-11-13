import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The landing is its own SPA (own entry, own build, own deploy) that borrows the app's code through "@/":
// the sphere's simulation and shaders, the Pomodoro presets, the breathing clock and the lofi stations are the
// real ones, not copies.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // Its own public folder: only the favicon and the icon (copies of the app's); the app's recordings and
  // service worker stay out of the landing's deploy.
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
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
