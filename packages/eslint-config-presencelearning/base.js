module.exports = {
  extends: [
    'eslint-config-presencelearning/legacy',
    'eslint-config-presencelearning/rules/es6',
  ].map(require.resolve),
  rules: {}
};
