import eslintPluginVue from 'eslint-plugin-vue'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import vueEslintParser from 'vue-eslint-parser'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...typescriptEslint.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['src/**/*.ts'],
  })),
  ...eslintPluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      sourceType: 'module',
      ecmaVersion: 2022,
    },
  })),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/require-default-prop': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
    },
  },
]
