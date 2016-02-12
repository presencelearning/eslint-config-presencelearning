module.exports = {
  extends: [
    'eslint-config-presencelearning/rules/best-practices',
    'eslint-config-presencelearning/rules/errors',
    'eslint-config-presencelearning/rules/legacy',
    'eslint-config-presencelearning/rules/node',
    'eslint-config-presencelearning/rules/style',
    'eslint-config-presencelearning/rules/variables'
  ].map(require.resolve),
  env: {
    browser: true,
    node: true,
    amd: false,
    mocha: false,
    jasmine: false
  },
  ecmaFeatures: {},
  globals: {},
  rules: {}
};
