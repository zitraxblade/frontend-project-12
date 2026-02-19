// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react-hooks', 'react-refresh', '@stylistic'],
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'node_modules/',
    'frontend/node_modules/',
    'frontend/dist/',
    'dist/',
    'test-results/',
  ],
  rules: {
    // react-refresh (аналог vite-конфига)
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

    '@stylistic/semi': ['error', 'never'],
    '@stylistic/eol-last': ['error', 'always'],
    '@stylistic/no-trailing-spaces': 'error',
    '@stylistic/padded-blocks': ['error', 'never'],

    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],

    '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
    '@stylistic/jsx-indent-props': ['error', 2],
    '@stylistic/jsx-closing-bracket-location': 'error',
    '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
  },
}