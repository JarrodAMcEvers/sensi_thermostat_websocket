module.exports = {
  'env': {
    'es6': true,
    'node': true,
    'jest': true
  },
  'extends': [
    'airbnb-base',
    'airbnb-typescript/base'
  ],
  'parserOptions': {
    'sourceType': 'module',
    'project': './tsconfig.json'
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
    ],
    'import/prefer-default-export': [
      'off'
    ],
    '@typescript-eslint/lines-between-class-members': ['off'],
    '@typescript-eslint/comma-dangle': ['off'],
    '@typescript-eslint/return-await': ['off']
  }
};
