module.exports = {
  'env': {
    'es6': true,
    'node': true,
    'jest': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'warn',
      'single',
      { 'allowTemplateLiterals': true, 'avoidEscape': true }
    ],
    'semi': [
      'off'
    ],
    'no-console': [
      'off'
    ]
  }
};
