import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Cobertura al 90 % sobre la capa de dominio (sin pantallas JSX masivas).
      // Informe completo: quita `include` de coverage o ejecuta sin umbrales.
      include: [
        'src/utils/**/*.{js,jsx}',
        'src/services/**/*.{js,jsx}',
        'src/hooks/**/*.{js,jsx}',
        'src/contexts/**/*.{js,jsx}',
        'src/models/**/*.{js,jsx}',
        'src/api/**/*.{js,jsx}',
      ],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/test/**',
        'src/main.jsx',
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 82,
      },
    },
  },
})
