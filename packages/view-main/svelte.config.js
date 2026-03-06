import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sveltePreprocess } from 'svelte-preprocess'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const rootPath = path.join(dirname, '../../')
const projectPath = path.join(rootPath, 'packages/view-main')

export const lessConfig = {
  modifyVars: {
    hack: `true; @import "${path.join(projectPath, 'src/assets/styles/mixin.less')}";`,
  },
}

const config = {
  // Consult https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/in-general.md
  // for more information about preprocessors
  compilerOptions: {
    runes: true,
  },
  preprocess: [
    sveltePreprocess({
      typescript: {
        tsconfigFile: path.join(projectPath, 'tsconfig.json'),
      },
      less: lessConfig,
    }),
  ],
}

export default config
