import { deleteSync } from 'del'
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

const runMainThread = async () => {
  const { createLogger } = (await dynamicImport('vite')) as typeof Vite
  const logger = createLogger('info')
  console.time('Build time')
  deleteSync(['build/**'], { cwd: rootPath })
  deleteSync(['dist/**'], { cwd: path.join(rootPath, 'packages/desktop') })

  const noop = () => {}

  const spinners = new Spinnies({ color: 'blue' })
  spinners.add('view-main', { text: 'view-main compiling' })
  spinners.add('desktop', { text: 'desktop compiling' })
  spinners.add('extension-preload', { text: 'extension-preload compiling' })
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
    runBuildWorkerStatus('desktop', noop).then(handleResult('desktop')),
    runBuildWorkerStatus('extension-preload', noop).then(handleResult('extension-preload')),
    // build(rendererConfig, noop).then(handleResult('renderer')),
  ]

  if (!(await Promise.all(buildTasks).then((result) => result.every((s) => s)))) {
    console.timeEnd('Build time')
    throw new Error('Build failed')
  }

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
