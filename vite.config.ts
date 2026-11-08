/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import { licensesPlugin } from './licenses-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), licensesPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // .claude/ holds local agent worktrees: copies of the app whose tests would run (and fail) here too.
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
