module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'prefer-destructuring': ['error', {
      array: false,
      object: true
    }],
    'no-param-reassign': 'warn',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement'
    ]
  },
  globals: {
    customElements: 'readonly',
    HTMLElement: 'readonly',
    HTMLFormElement: 'readonly',
    dispatchEvent: 'readonly',
    addEventListener: 'readonly',
    removeEventListener: 'readonly',
    CustomEvent: 'readonly',
    WebSocket: 'readonly',
    EventSource: 'readonly',
    BroadcastChannel: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    setInterval: 'readonly',
    clearTimeout: 'readonly',
    clearInterval: 'readonly',
    console: 'readonly',
    document: 'readonly',
    location: 'readonly',
    Math: 'readonly',
    Date: 'readonly',
    JSON: 'readonly',
    Array: 'readonly',
    Object: 'readonly',
    Function: 'readonly',
    Promise: 'readonly'
  }
};
