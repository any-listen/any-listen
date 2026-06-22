import type { ChildProcessWithoutNullStreams } from 'node:child_process'

// import del from 'del'
import { debounce } from '@any-listen/common/utils'
import { Arch, buildConfig, replaceLib, runDesktop } from '@any-listen/desktop'
import colors from 'picocolors'
import type { Logger } from 'vite'

import copyAssets from './copyAssets'
import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'
import { buildSuatus, runBuildWorkerStatus, taskTools } from './utils'

let logger: Logger

// del.sync(['dist/**'])

const logs = [
  'Manifest version 2 is deprecated, and support will be removed in 2023',
  '"Extension server error: Operation failed: Permission denied", source: devtools://devtools/bundled',

  // https://github.com/electron/electron/issues/32133
  '"Electron sandbox_bundle.js script failed to run"',
  '"TypeError: object null is not iterable (cannot read property Symbol(Symbol.iterator))",',
]
function desktopLog(data: Buffer, color: 'red' | 'blue') {
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
  let desktopProcess: ChildProcessWithoutNullStreams | undefined
  const runDesktopDelay = debounce(() => {
    desktopProcess = runDesktop(desktopLog)
  }, 200)

  const noop = () => {}
  const handleUpdate = () => {
    logger.info(colors.green('\nrebuild the desktop main process successfully'))

    if (desktopProcess) {
      desktopProcess.removeAllListeners()

      // 候选： fkill / pidtree
      desktopProcess.kill()
    }
    runDesktopDelay()

    logger.info(colors.green('\nrestart desktop app...'))
  }

  taskTools.addTask('view-main', async () => runBuildWorkerStatus('view-main', noop))
  taskTools.addTask('view-lyric', async () => runBuildWorkerStatus('view-lyric', noop))
  taskTools.addTask('extension-preload', async () => runBuildWorkerStatus('extension-preload', handleUpdate))
  taskTools.addTask('desktop', async () =>
    replaceLib({ desktopPlatformName: process.platform, arch: Arch[process.arch as keyof typeof Arch] }).then(async () => {
      return buildSuatus(buildConfig('desktop'), handleUpdate)
    })
  )

  await taskTools.runTasks()
  // listr.run().then(() => {
  await copyAssets('desktop')
  desktopProcess = runDesktop(desktopLog)

  logger.info(colors.green('\nAll task build successfully'))
  // })
  console.timeEnd('init')
}

void runMainThread()
