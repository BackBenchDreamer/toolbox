// @ts-check
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**'],
  },
  // Base rules for all TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Disallow console.log everywhere except explicitly allowed contexts below.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // CLI override: console.log is intentional terminal output, not debugging noise.
  {
    files: ['cli/src/**/*.ts'],
    rules: {
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
    },
  },
];

export default config;
