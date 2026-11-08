import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'
import { licensesPlugin } from './licenses-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), licensesPlugin()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // three.js (~540 kB) is its own lazy chunk, loaded after the first paint: big on purpose, not a missed split.
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Local worktrees (git-ignored) hold copies of the app whose tests would run (and fail) here too.
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
