module.exports = {
  extends: [
    'eslint-config-presencelearning/base',
    'eslint-config-presencelearning/rules/strict',
    'eslint-config-presencelearning/rules/angularjs',
  ].map(require.resolve),
  rules: {}
};
