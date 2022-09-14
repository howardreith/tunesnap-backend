module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
    jest: true,
  },
  extends: [
    'airbnb-base', "plugin:jest/recommended"
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    babelOptions: {
      plugins: [
        '@babel/plugin-syntax-import-assertions'
      ],
    },
  },
  rules: {
    'import/extensions': 0,
    'no-underscore-dangle': 0,
  },
};
