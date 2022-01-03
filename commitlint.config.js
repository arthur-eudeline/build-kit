module.exports = {
  extends: [ '@commitlint/config-conventional' ],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'webpack'
      ]
    ],
    'subject-case': [ 0 ]
  }
}