import { jsNode, typescript, typescriptParser } from '@any-listen/eslint/eslint.config.mjs'

/** @type {import('eslint').Linter.Config[]} */
export default [
  jsNode,
  typescript,
  {
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
]
