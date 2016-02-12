import fs from 'fs';
import path from 'path';
import test from 'tape';

const files = {
  base: require('../base')
};

fs.readdirSync(path.join(__dirname, '../rules')).forEach(name => {
  if (name === 'angularjs.js') {
    return;
  }

  files[name] = require(`../rules/${name}`);
});

Object.keys(files).forEach(name => {
  const config = files[name];

  test(`${name}: does not reference angularjs`, t => {
    t.plan(2);

    t.notOk(config.plugins, 'plugins is unspecified');

    // scan rules for angularjs/ and fail if any exist
    const angularjsRuleIds = Object.keys(config.rules)
      .filter(ruleId => ruleId.indexOf('angularjs/') === 0);
    t.deepEquals(angularjsRuleIds, [], 'there are no angularjs/ rules');
  });
});
