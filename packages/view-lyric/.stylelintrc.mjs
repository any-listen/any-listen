import config from '@any-listen/eslint/stylelintrc.mjs'

export default {
  ...config,
  extends: [...config.extends, 'stylelint-config-html/svelte'],
}
