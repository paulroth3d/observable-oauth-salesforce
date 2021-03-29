module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'arrow-body-style': 'off',
    'comma-dangle': 'off',
    'no-unused-vars': ['error', { args: 'none' }],
    'no-trailing-spaces': 'off'
  }
};
