import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ["./src/setup.ts"],
    css: false,
    deps: {
      inline: ['@testing-library/user-event']
    }
  },
})
