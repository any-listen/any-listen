import { jsBrowser, typescript, typescriptParser } from '@any-listen/eslint/eslint.config.mjs'
import eslintPluginSvelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import svelteConfig from './svelte.config.js'
// import { typescriptRule } from '@any-listen/eslint/eslint.config.mjs'
/** @type {import('eslint').Linter.Config[]} */
export default [
  // {
  //   files: ['**/*.{js,mjs,cjs,ts,svelte}'],
  // },
  jsBrowser,
  {
    ...typescript,
    files: ['**/*.svelte', '**/*.ts'],
  },
  {
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
        project: './tsconfig.json',
      },
    },
  },
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte', '*.svelte', '**/*.svelte.ts', '*.svelte.ts', '**/*.svelte.js', '*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        projectService: true,
        svelteConfig,
        sourceType: 'module',
        parser: typescriptParser,
        project: './tsconfig.json',
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
    },
  },
  // {
  //   files: ['**/*.svelte', '*.svelte'],
  //   languageOptions: {
  //     parser: svelteParser,
  //     parserOptions: {
  //       svelteConfig,
  //       sourceType: 'module',
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //       parser: typescriptParser,
  //       project: './tsconfig.json',
  //       extraFileExtensions: ['.svelte'],
  //     },
  //   },
  // },
]
