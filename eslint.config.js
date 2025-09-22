const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'prefer-const': ['error', { destructuring: 'all' }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
  },
];
