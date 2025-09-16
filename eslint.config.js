import js from '@eslint/js';

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  navigator: 'readonly',
  performance: 'readonly',
  fetch: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  localStorage: 'readonly',
  clearTimeout: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  HTMLElement: 'readonly',
  HTMLCanvasElement: 'readonly',
};

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...browserGlobals,
      },
    },
  },
  {
    files: ['api/**/*.js'],
    languageOptions: {
      globals: {
        URLSearchParams: 'readonly',
      },
    },
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];
