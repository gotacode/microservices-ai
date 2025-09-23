import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'json', 'text-summary'],
      all: true,
      include: ['src/**/*.ts'],
      lines: 85,
      functions: 85,
      branches: 85,
      statements: 85,
      exclude: ['src/constants/auth.ts', 'src/stores/state.ts'],
    },
  },
});
