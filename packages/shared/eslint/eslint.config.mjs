import pluginJs from '@eslint/js'
import love from 'eslint-config-love'
import globals from 'globals'
// import { typescriptRule } from './eslintrc.base.mjs'
// import tseslint from "typescript-eslint";
import typescriptParser from '@typescript-eslint/parser'

export { typescriptParser }
export const baseRule = {
  // 'no-new': 'off',
  // camelcase: 'off',
  // 'no-return-assign': 'off',
  // 'space-before-function-paren': ['error', 'never'],
  // 'no-var': 'error',
  // 'no-fallthrough': 'off',
  eqeqeq: 'off',
  'require-atomic-updates': ['error', { allowProperties: true }],
  // 'no-multiple-empty-lines': ['error', { max: 2 }],
  // 'comma-dangle': [2, 'always-multiline'],
  // 'standard/no-callback-literal': 'off',
  'prefer-const': 'off',
  // 'no-labels': 'off',
  // 'node/no-callback-literal': 'off',
  // 'multiline-ternary': 'off',
  // 'sort-imports': [
  //   'error',
  //   {
  //     ignoreCase: false,
  //     ignoreDeclarationSort: true,
  //     ignoreMemberSort: false,
  //     memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
  //     allowSeparatedGroups: true,
  //   },
  // ],
  // 'multiline-comment-style': ['error', 'starred-block'],
  'no-else-return': 'error',
  'object-shorthand': ['error', 'always'],
  'prefer-arrow-callback': 'error',
  'prefer-object-spread': 'error',
  'prefer-template': 'error',
  yoda: 'error',
  'no-console': 'off',
  'no-await-in-loop': 'off',
  'promise/avoid-new': 'off',
  // 'no-magic-numbers': 'off',
  // 'prefer-destructuring': 'off',
  'eslint-comments/no-unlimited-disable': 'off',
  'eslint-comments/require-description': 'off',
  curly: ['error', 'multi-line'],
  'arrow-body-style': 'off',
  'max-nested-callbacks': 'off',
  complexity: 'off',
  'max-lines': 'off',
  'no-param-reassign': 'off',
  'no-plusplus': 'off',
  'prefer-named-capture-group': 'off',
  '@eslint-community/eslint-comments/require-description': 'off',
  'require-unicode-regexp': 'off',
  radix: 'off',
}
export const typescriptRule = {
  ...baseRule,
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/init-declarations': 'off',
  '@typescript-eslint/no-unsafe-type-assertion': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/no-empty-function': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unnecessary-type-conversion': 'off',
  '@typescript-eslint/no-explicit-any': 'warn',

  '@typescript-eslint/no-confusing-void-expression': [
    'error',
    {
      ignoreVoidReturningFunctions: true,
    },
  ],
  '@typescript-eslint/no-unnecessary-type-parameters': 'off',
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/max-params': [
    'error',
    {
      max: 6,
    },
  ],
}

/** @type {import('eslint').Linter.Config} */
export const js = {
  files: ['**/*.{js,mjs,cjs}'],
  ...pluginJs.configs.recommended,
  rules: {
    ...pluginJs.configs.recommended.rules,
    ...baseRule,
  },
}

/** @type {import('eslint').Linter.Config} */
export const jsNode = {
  ...js,
  languageOptions: {
    globals: globals.node,
  },
}

/** @type {import('eslint').Linter.Config} */
export const jsBrowser = {
  ...js,
  languageOptions: {
    globals: globals.browser,
  },
}

/** @type {import('eslint').Linter.Config} */
export const typescript = {
  ...love,
  // files: ['**/*.{ts}'],
  files: ['**/*.ts'],
  rules: {
    ...love.rules,
    ...typescriptRule,
  },
}

/** @type {import('eslint').Linter.Config[]} */
export default [
  // love,
  // {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  // {languageOptions: { globals: globals.commonjs }},
  // pluginJs.configs.recommended,
  // ...tseslint.configs.recommended,
  js,
  typescript,
  {
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
        project: './tsconfig.json',
      },
    },
  },
]
