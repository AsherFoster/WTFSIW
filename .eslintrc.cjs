// .eslintrc.cjs
// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@asherfoster/eslint-config/patch');

module.exports = {
  extends: [
    '@asherfoster',
    // '@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  rules: {
    // TODO import ordering
    'react/jsx-filename-extension': 'off',
    curly: ['error', 'multi-line'],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/prefer-function-type': ['error'],
  },
  parserOptions: {tsconfigRootDir: __dirname, ecmaVersion: 2022},
};
