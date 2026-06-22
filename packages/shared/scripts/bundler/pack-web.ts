import fs from 'node:fs/promises'
import path from 'node:path'

import { deleteSync } from 'del'
import colors from 'picocolors'

// import rendererConfig from './configs/renderer'
import copyAssets from './copyAssets'
import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'
import { runBuildWorkerStatus, taskTools } from './utils'

// process.env.VITE_CJS_TRACE = 'true'

const rootPath = path.join(__dirname, '../../../../')

const updateWebPreloadFileName = async (name: 'view-main' | 'view-lyric') => {
  const publicDir = path.join(rootPath, 'build/public')
  const ipcFileName = (await fs.readdir(publicDir)).find((f) => f.startsWith(`${name}.ipc.`))
  if (!ipcFileName) throw new Error(`${name}.ipc file not found`)
  const idxHtml = path.join(publicDir, 'index.html')
  await fs.writeFile(idxHtml, (await fs.readFile(idxHtml)).toString().replace(`${name}.ipc.js`, ipcFileName))
}

const runMainThread = async () => {
  const { createLogger } = (await dynamicImport('vite')) as typeof Vite
  const logger = createLogger('info')
  console.time('Build time')
  deleteSync(['build/**'], { cwd: rootPath })

  const noop = () => {}

  taskTools.addTask('view-main', async () => runBuildWorkerStatus('view-main', noop))
  taskTools.addTask('view-lyric', async () => runBuildWorkerStatus('view-lyric', noop))
  taskTools.addTask('web-preload', async () => runBuildWorkerStatus('web-preload', noop))
  taskTools.addTask('extension-preload', async () => runBuildWorkerStatus('extension-preload', noop))
  taskTools.addTask('web-server', async () => runBuildWorkerStatus('web-server', noop))

  await taskTools.runTasks()

  await copyAssets('web')
  await updateWebPreloadFileName('view-main')
  await updateWebPreloadFileName('view-lyric')

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
