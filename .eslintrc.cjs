// .eslintrc.cjs
// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@asherfoster/eslint-config/patch');

module.exports = {
  extends: [
    '@asherfoster',
    // @typescript-eslint/recommended-requiring-type-checking
  ],
  rules: {
    // todo @typescript-eslint/member-delimiter-style
    '@typescript-eslint/object-curly-spacing': 0,
    'object-curly-spacing': 0,
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    '@typescript-eslint/prefer-function-type': ['error']
  },
  parserOptions: {tsconfigRootDir: __dirname}
};
