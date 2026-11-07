/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { licensesPlugin } from './licenses-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), licensesPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
