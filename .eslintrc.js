module.exports = {
  env: { node: true, es2022: true, browser: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
