module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens within a monorepos)
  root: true,

  parserOptions: {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX (not typically used in Quasar Vue templates, but good to have if needed)
    },
  },

  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true, // Enables support for <script setup> SFC macros
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    // ESLint rules for TypeScript
    'plugin:@typescript-eslint/recommended',

    // https://eslint.vuejs.org/rules/#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead
    // ESLint rules for Vue 3
    'plugin:vue/vue3-recommended', // ou 'plugin:vue/vue3-essential' ou 'plugin:vue/vue3-strongly-recommended'

    // --- QUASAR ---
    // https://github.com/quasarframework/eslint-plugin-quasar#recommended-rules
    // ESLint rules for Quasar
    'plugin:quasar/recommended',
    // --- END QUASAR ---

    // https://github.com/prettier/eslint-config-prettier#installation
    // Make sure to put this last, so it gets the chance to override other configs.
    'prettier', // Turns off all rules that are unnecessary or might conflict with Prettier.
  ],

  plugins: [
    // Required to lint *.vue files
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // 'vue' // plugin:vue/vue3-recommended já deve registrar

    // Required to apply rules for TypeScript code
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    // '@typescript-eslint' // plugin:@typescript-eslint/recommended já deve registrar

    // https://github.com/quasarframework/eslint-plugin-quasar#installation
    // 'quasar' // plugin:quasar/recommended já deve registrar

    'prettier', // Runs Prettier as an ESLint rule.
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly', // Adicionado para evitar erros com process.env
    Capacitor: 'readonly',
    chrome: 'readonly',
    // $q é automaticamente reconhecido pelo plugin:quasar/recommended
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',

    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',

    // Vue / Quasar
    'vue/multi-word-component-names': 'off', // Comum desabilitar para páginas como IndexPage.vue
    'quasar/no-legacy-components': 'warn',
    'quasar/no-legacy-css': 'warn',
    'quasar/no-legacy-directives': 'warn',
    'quasar/no-legacy-plugins': 'warn', // Ex: $q.platform.is.desktop vs $q.platform.desktop

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // Prettier
    'prettier/prettier': [
      'warn', // ou 'error' se você quiser que o ESLint falhe se o Prettier não estiver satisfeito
      {
        // Suas opções do Prettier podem ir aqui, ou use um arquivo .prettierrc.js
        // Ex:
        // "singleQuote": true,
        // "semi": true,
        // "trailingComma": "all"
      },
    ],
  },
};
