import { deleteSync } from 'del'
import fs from 'node:fs/promises'
import path from 'node:path'
import colors from 'picocolors'
import Spinnies from 'spinnies'
import { type TaksName, runBuildWorkerStatus } from './utils'
// import rendererConfig from './configs/renderer'
import copyAssets from './copyAssets'
import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'

// process.env.VITE_CJS_TRACE = 'true'

const rootPath = path.join(__dirname, '../../../../')

const updateWebPreloadFileName = async () => {
  const publicDir = path.join(rootPath, 'build/public')
  const ipcFileName = (await fs.readdir(publicDir)).find((f) => f.startsWith('view-main.ipc.'))
  if (!ipcFileName) throw new Error('view-main.ipc file not found')
  const idxHtml = path.join(publicDir, 'index.html')
  await fs.writeFile(idxHtml, (await fs.readFile(idxHtml)).toString().replace('view-main.ipc.js', ipcFileName))
}

const runMainThread = async () => {
  const { createLogger } = (await dynamicImport('vite')) as typeof Vite
  const logger = createLogger('info')
  console.time('Build time')
  deleteSync(['build/**'], { cwd: rootPath })

  const noop = () => {}

  const spinners = new Spinnies({ color: 'blue' })
  spinners.add('view-main', { text: 'view-main compiling' })
  spinners.add('web-preload', { text: 'web-preload compiling' })
  spinners.add('extension-preload', { text: 'extension-preload compiling' })
  spinners.add('web-server', { text: 'web-server compiling' })
  const handleResult = (name: TaksName) => {
    return (success: boolean) => {
      if (success) {
        spinners.succeed(name, { text: `${name} compile success!` })
      } else {
        spinners.fail(name, { text: `${name} compile fail!` })
      }
      return success
    }
  }

  const buildTasks = [
    runBuildWorkerStatus('view-main', noop).then(handleResult('view-main')),
    runBuildWorkerStatus('web-server', noop).then(handleResult('web-server')),
    runBuildWorkerStatus('extension-preload', noop).then(handleResult('extension-preload')),
    runBuildWorkerStatus('web-preload', noop).then(handleResult('web-preload')),
    // build(rendererConfig, noop).then(handleResult('renderer')),
  ]

  if (!(await Promise.all(buildTasks).then((result) => result.every((s) => s)))) {
    console.timeEnd('Build time')
    throw new Error('Build failed')
  }

  await copyAssets('web')
  await updateWebPreloadFileName()

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
