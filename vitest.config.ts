import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['solutions/**/*.test.{ts,tsx}'],
    css: true,
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    collectCoverage: true,
    include: ['solutions/**/*.{ts,tsx}'],
    exclude: ['**/*.test.{ts,tsx}', 'src/test-setup.ts', '**/*.types.ts', 'src/main.tsx'],
  }
})
