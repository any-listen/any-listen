// 该配置用于 Svelte for VS Code 扩展
// 与代码构建无关
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sveltePreprocess } from 'svelte-preprocess'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const rootPath = path.join(dirname, '../../')
const projectPath = path.join(rootPath, 'packages/view-main')

const config = {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  compilerOptions: {
    runes: true,
  },
  preprocess: [
    sveltePreprocess({
      typescript: {
        tsconfigFile: path.join(projectPath, 'tsconfig.json'),
      },
      less: {
        modifyVars: {
          hack: 'true; @import "packages/view-main/src/assets/styles/mixin.less";',
        },
      },
    }),
  ],
}

export default config
