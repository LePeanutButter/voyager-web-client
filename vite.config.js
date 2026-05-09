import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const env = globalThis.process?.env ?? {}
const ciFullCoverage =
  env.CI === 'true' || env.VITEST_COVERAGE_FULL === '1'

const coverageDomainInclude = [
  'src/utils/**/*.{js,jsx}',
  'src/services/**/*.{js,jsx}',
  'src/hooks/**/*.{js,jsx}',
  'src/contexts/**/*.{js,jsx}',
  'src/models/**/*.{js,jsx}',
  'src/api/**/*.{js,jsx}',
]

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
      // Local: 90% on domain layer. CI (Sonar): all `src/**` in LCOV without global thresholds.
      include: ciFullCoverage ? ['src/**/*.{js,jsx}'] : coverageDomainInclude,
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/test/**',
        'src/main.jsx',
      ],
      thresholds: ciFullCoverage
        ? undefined
        : {
            lines: 90,
            statements: 90,
            functions: 90,
            branches: 82,
          },
    },
  },
})
