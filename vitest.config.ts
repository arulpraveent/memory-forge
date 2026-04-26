import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/vitest.setup.ts'],
    include: ['server/**/*.spec.ts', 'app/**/*.spec.ts'],
    environmentMatchGlobs: [
      ['app/**', 'nuxt'],
      ['server/**', 'node'],
    ],
  },
  resolve: {
    alias: {
      '#supabase/server': fileURLToPath(
        new URL('./tests/__mocks__/supabase-server.ts', import.meta.url),
      ),
    },
  },
})
