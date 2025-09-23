import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'json', 'text-summary'],
      all: true,
      include: ['src/**/*.ts'],
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
  },
});
