import { jsBrowser, typescript, typescriptParser } from '@any-listen/eslint/eslint.config.mjs'
import svelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'

import svelteConfig from './svelte.config.js'
// import { typescriptRule } from '@any-listen/eslint/eslint.config.mjs'
/** @type {import('eslint').Linter.Config[]} */
const config = [
  jsBrowser,
  {
    ...typescript,
    files: ['**/*.svelte', '**/*.ts'],
  },
  {
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
  ...svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        projectService: true,
        svelteConfig,
        // sourceType: 'module',
        parser: typescriptParser,
        extraFileExtensions: ['.svelte'],
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-useless-default-assignment': 'off',
    },
  },
]

export default config
