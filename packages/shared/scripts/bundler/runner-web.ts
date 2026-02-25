import type { ChildProcessWithoutNullStreams } from 'node:child_process'

// import del from 'del'
import { DEV_SERVER_PORTS } from '@any-listen/common/constants'
import { buildConfig, runServer } from '@any-listen/web-server'
import colors from 'picocolors'
import Spinnies from 'spinnies'
import type { Logger } from 'vite'

import copyAssets from './copyAssets'
import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'
import { type TaskName, buildSuatus, runBuildWorker, runBuildWorkerStatus } from './utils'

let logger: Logger

// del.sync(['dist/**'])
const logs: string[] = []
function serverLog(data: Buffer, color: 'red' | 'blue') {
  let log = data.toString()
  if (/[0-9A-z]+/.test(log)) {
    // 抑制某些无关的报错日志
    if (color == 'red' && typeof log === 'string' && logs.some((l) => log.includes(l))) return

    logger.info(colors[color](log))
  }
}

const runMainThread = async () => {
  console.time('init')
  const { createLogger } = (await dynamicImport('vite')) as typeof Vite
  logger = createLogger('info')

  // let server: ViteDevServer | undefined
  let serverProcess: ChildProcessWithoutNullStreams | undefined

  const noop = () => {}
  const handleUpdate = () => {
    logger.info(colors.green('\nrebuild the web server main process successfully'))

    if (serverProcess) {
      serverProcess.removeAllListeners()
      serverProcess.kill()
    }

    serverProcess = runServer(serverLog)
    logger.info(colors.green('\nrestart web server...'))
  }

  const spinners = new Spinnies({ color: 'blue' })
  spinners.add('view-main', { text: 'view-main compiling' })
  spinners.add('web-preload', { text: 'web-preload compiling' })
  spinners.add('extension-preload', { text: 'extension-preload compiling' })
  // spinners.add('renderer-lyric', { text: 'renderer-lyric compiling' })
  spinners.add('web-server', { text: 'web-server compiling' })
  const handleResult = (name: TaskName) => {
    return (success: boolean) => {
      if (success) {
        spinners.succeed(name, { text: `${name} compile success!` })
      } else {
        spinners.fail(name, { text: `${name} compile fail!` })
      }
      return success
    }
  }

  let viewMainBuild: { status: boolean; reload: () => void }
  const buildTasks = [
    runBuildWorker('view-main', noop)
      .then((result) => {
        viewMainBuild = result
        return result.status
      })
      .then(handleResult('view-main')),
    runBuildWorkerStatus('web-preload', () => {
      viewMainBuild.reload()
    }).then(handleResult('web-preload')),
    runBuildWorkerStatus('extension-preload', handleUpdate).then(handleResult('extension-preload')),
    buildSuatus(buildConfig('web-server'), handleUpdate).then(handleResult('web-server')),
  ]

  if (!(await Promise.all(buildTasks).then((result) => result.every((s) => s)))) return
  // listr.run().then(() => {
  await copyAssets('web')
  serverProcess = runServer(serverLog)

  // const config = await getViewMainConfig('web-server')
  logger.info(colors.green('\nAll task build successfully'))
  // })
  console.timeEnd('init')
  logger.info(colors.yellow(`web UI running: ` + `http://localhost:${DEV_SERVER_PORTS['view-main']}`))
}

void runMainThread()
