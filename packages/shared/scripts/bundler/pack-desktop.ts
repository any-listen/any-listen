import path from 'node:path'

import { deleteSync } from 'del'
import colors from 'picocolors'
import { createLogger } from 'vite'

// import rendererConfig from './configs/renderer'
import copyAssets from './copyAssets'
import { runBuildWorkerStatus, taskTools } from './utils'

// process.env.VITE_CJS_TRACE = 'true'
const logger = createLogger('info')

const rootPath = path.join(__dirname, '../../../../')

const runMainThread = async () => {
  console.time('Build time')
  deleteSync(['build/**'], { cwd: rootPath })
  deleteSync(['dist/**'], { cwd: path.join(rootPath, 'packages/desktop') })

  const noop = () => {}

  taskTools.addTask('view-main', async () => runBuildWorkerStatus('view-main', noop))
  taskTools.addTask('view-lyric', async () => runBuildWorkerStatus('view-lyric', noop))
  taskTools.addTask('extension-preload', async () => runBuildWorkerStatus('desktop', noop))
  taskTools.addTask('desktop', async () => runBuildWorkerStatus('extension-preload', noop))

  await taskTools.runTasks()

  await copyAssets('desktop')

  // listr.run().then(() => {

  logger.info(colors.green('\nAll task build successfully'))
  // })
  console.timeEnd('Build time')
}

void runMainThread()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
    throw err as Error
  })
