5.1.0 / TBD
 - [rulechange] remove no-param-reassign "props" requirement - it will be extreamly difficult to refactor code to use pure functions. Keeping the no reassign as warning.
 - [migrate to 2.0] changed space-before-keywords and space-after-keywords to keyword-spacing, removed space-return-throw-case (part of keyword-spacing now)
 - [migrate to 2.0] Changed no-empty-labels to 'no-labels': [2, {"allowLoop": true, "allowSwitch": true}]
 - [globals] Add globals _, 
 - [to warn] Changed prefer-arrow-callback from error to warn
 - [to warn] Changed no-undef from error to warn
 - [to warn] Changed no-mixed-spaces-and-tabs from error to warn
 - [to warn] Changed no-multi-spaces to warning from error
 - [to warn] Changed vars-on-top to warning from error
 - [to warn] Changed no-unused-vars to warning from error
 - [to warn] Changed comma-style to warning from error
 - [to warn] Changed comma-spacing to warning from error
 - [to warn] Changed camelcase to warning from error
 - [to warn] Changed array-bracket-spacing to warning from error
 - [to warn] Changed brace-style to warning from error
 - [to warn] Changed key-spacing to warning from error
 - [to warn] Changed quotes to warning from error
 - [to warn] Changed comma-spacing to warning from error
 - [to warn] Changed space-before-keywords to warning from error
 - [to warn] Changed space-after-keywords to warning from error
 - [to warn] Changed object-shorthand to warning from error
 - [to warn] Changed space-infix-ops to warning from error
 - [to warn] Changed no-var to warning from error
 - [to warn] Changed padded-blocks to warning from error
 - [to warn] Changed eol-last to warning from error
 - [to warn] Changed no-param-reassign to warning from error
 - [to warn] Changed space-before-function-paren from error to warning
 - [to warn] Changed comma-dangle from error to warning
 - [to warn] Changed spaced-comment from error to warning
 - [to warn] Changed max-len from error to warning
 - [rulechange] Changed max-len to 120 from 100.
 - [rulechange] remove 3.1 disallowIdentifierNames since we don't support ie8
 - [rulechange] change indent from 2 to 4 spaces
 - [rulechange] disallowSpacesInFunction:beforeOpeningRoundBrace,
                requireSpacesInFunction:beforeOpeningCurlyBrace
 - [rulechange] remove JSX rules
 

5.0.0 / 2016-01-26
==================
 - Forked from https://github.com/airbnb/javascript/commits/master (sha 79a6bfa101848a6d8e7af45abf2063982c838ee0)
 - [formatting] update references from airbnb to PresenceLearning


4.0.0 / 2016-01-22
==================
 - [breaking] require outer IIFE wrapping; flesh out guide section
 - [minor] Add missing `arrow-body-style`, `prefer-template` rules (#678)
 - [minor] Add `prefer-arrow-callback` to ES6 rules (to match the guide) (#677)
 - [Tests] run `npm run lint` as part of tests; fix errors
 - [Tests] use `parallelshell` to parallelize npm run-scripts

3.1.0 / 2016-01-07
==================
 - [minor] Allow multiple stateless components in a single file

3.0.2 / 2016-01-06
==================
 - [fix] Ignore URLs in `max-len` (#664)

3.0.1 / 2016-01-06
==================
 - [fix] because we use babel, keywords should not be quoted

3.0.0 / 2016-01-04
==================
 - [breaking] enable `quote-props` rule (#632)
 - [breaking] Define a max line length of 100 characters (#639)
 - [breaking] [react] Minor cleanup for the React styleguide, add `react/jsx-no-bind` (#619)
 - [breaking] update best-practices config to prevent parameter object manipulation (#627)
 - [minor] Enable react/no-is-mounted rule (#635, #633)
 - [minor] Sort react/prefer-es6-class alphabetically (#634)
 - [minor] enable react/prefer-es6-class rule
 - Permit strict mode in "legacy" config
 - [react] add missing rules from eslint-plugin-react (enforcing where necessary) (#581)
 - [dev deps] update `eslint-plugin-react`

2.1.1 / 2015-12-15
==================
 - [fix] Remove deprecated react/jsx-quotes (#622)

2.1.0 / 2015-12-15
==================
 - [fix] use `require.resolve` to allow nested `extend`s (#582)
 - [new] enable `object-shorthand` rule (#621)
 - [new] enable `arrow-spacing` rule (#517)
 - [docs] flesh out react rule defaults (#618)

2.0.0 / 2015-12-03
==================
 - [breaking] `space-before-function-paren`: require function spacing: `function <optional name>(` (#605)
 - [breaking] `indent`: Fix switch statement indentation rule (#606)
 - [breaking] `array-bracket-spacing`, `computed-property-spacing`: disallow spacing inside brackets (#594)
 - [breaking] `object-curly-spacing`: require padding inside curly braces (#594)
 - [breaking] `space-in-parens`: disallow spaces in parens (#594)

1.0.2 / 2015-11-25
==================
 - [breaking] `no-multiple-empty-lines`: only allow 1 blank line at EOF (#578)
 - [new] `restParams`: enable rest params (#592)

1.0.1 / 2015-11-25
==================
 - *erroneous publish*

1.0.0 / 2015-11-08
==================
 - require `eslint` `v1.0.0` or higher
 - remove `babel-eslint` dependency

0.1.1 / 2015-11-05
==================
 - remove id-length rule (#569)
 - enable `no-mixed-spaces-and-tabs` (#539)
 - enable `no-const-assign` (#560)
 - enable `space-before-keywords` (#554)

0.1.0 / 2015-11-05
==================
 - switch to modular rules files courtesy the [eslint-config-default][ecd] project and [@taion][taion]. [PR][pr-modular]
 - export `eslint-config-airbnb/legacy` for ES5-only users. `eslint-config-airbnb/legacy` does not require the `babel-eslint` parser. [PR][pr-legacy]

0.0.9 / 2015-09-24
==================
- add rule `no-undef`
- add rule `id-length`

0.0.8 / 2015-08-21
==================
 - now has a changelog
 - now is modular (see instructions above for with react and without react versions)

0.0.7 / 2015-07-30
==================
 - TODO: fill in

[ecd]: https://github.com/walmartlabs/eslint-config-defaults
[taion]: https://github.com/taion
[pr-modular]: https://github.com/airbnb/javascript/pull/526
[pr-legacy]: https://github.com/airbnb/javascript/pull/527
