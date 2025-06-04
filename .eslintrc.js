module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      files: ['*'],
      rules: {
        'consistent-return': 'off',
        'no-underscore-dangle': 'off',
        'no-return-assign': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-console': 'off',
        'prefer-destructuring': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
  },
};
