# eslint-config-presencelearning

This package provides PresenceLearning's .eslintrc as an extensible shared config.

## Usage

We export three ESLint configurations for your usage.

### eslint-config-presencelearning

Our default export contains all of our ESLint rules, including EcmaScript 6+
and AngularJS. It requires `eslint` and `eslint-plugin-angular`.

1. `npm install --save-dev git+ssh://git@github.com:presencelearning/eslint-config-presencelearning.git eslint-plugin-angular eslint`
2. add `"extends": "presencelearning"` to your .eslintrc. Example, your .eslintrc file should look like this:
    {
        "extends": "presencelearning"
    }
3. test by running `eslint <change-this-to-your-path-to-js-file>`. Note that eslint must not be installed globally or you need to run `./node_modules/.bin/eslint <change-this-to-your-path-to-js-file>`

### eslint-config-presencelearning/base

Lints ES6+ but *does not lint AngularJS*. Requires `eslint`.

1. `npm install --save-dev eslint-config-presencelearning eslint`
2. add `"extends": "presencelearning/base"` to your .eslintrc

See [PresenceLearnings Javascript styleguide](https://github.com/presencelearning/javascript) and
the [ESlint config docs](http://eslint.org/docs/user-guide/configuring#extending-configuration-files)
for more information.

## Improving this config

Consider adding test cases if you're making complicated rules changes, like
anything involving regexes. Perhaps in a distant future, we could use literate
programming to structure our README as test cases for our .eslintrc?

You can run tests with `npm test`.

You can make sure this module lints with itself using `npm run lint`.
