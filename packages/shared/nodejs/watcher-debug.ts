import fs from 'node:fs'

import chokidar from './chokidar/index.js'

globalThis.__any_listen_watcher_logger = (...args: any[]) => {
  console.debug('[ChokidarInternal]', ...args)
}
export const watcherDebug = async (logger: AnyListen.Logger, root: string) => {
  globalThis.__any_listen_watcher_logger = (...args: any[]) => {
    logger.debug('[ChokidarInternal]', ...args)
  }
  logger.debug('[WatcherDebug] ========== START ==========')
  logger.debug('[WatcherDebug] root:', root)

  logger.debug('[WatcherDebug] exists:', fs.existsSync(root))

  logger.debug('[WatcherDebug] stat:', JSON.stringify(fs.statSync(root)))

  const runChokidarTest = async (usePolling: boolean) => {
    return new Promise<void>((resolve) => {
      logger.debug('[WatcherDebug] ========== CHOKIDAR TEST ==========')

      logger.debug('[WatcherDebug] [CHOKIDAR] usePolling:', usePolling)

      const watcher = chokidar.watch(root, {
        persistent: true,
        ignoreInitial: false,

        usePolling,
        interval: 1000,

        depth: undefined,
      })

      let addCount = 0
      let addDirCount = 0
      let unlinkCount = 0
      let unlinkDirCount = 0
      let changeCount = 0

      watcher.on('all', (event, filePath) => {
        if (event === 'add') {
          addCount++
        } else if (event === 'addDir') {
          addDirCount++
        } else if (event === 'unlink') {
          unlinkCount++
        } else if (event === 'unlinkDir') {
          unlinkDirCount++
        } else if (event === 'change') {
          changeCount++
        }

        // 不输出具体文件，避免产生大量日志
        logger.debug('[WatcherDebug] [CHOKIDAR]', event, filePath)
      })

      watcher.on('ready', async () => {
        logger.debug('[WatcherDebug] [CHOKIDAR] READY')

        logger.debug(
          '[WatcherDebug] [CHOKIDAR] SUMMARY:',
          JSON.stringify({
            usePolling,
            addCount,
            addDirCount,
            unlinkCount,
            unlinkDirCount,
            changeCount,
          })
        )

        const watched = watcher.getWatched()

        logger.debug(
          '[WatcherDebug] [CHOKIDAR] WATCHED:',
          JSON.stringify(
            Object.entries(watched).map(([directory, files]) => ({
              directory,
              count: files.length,
            }))
          )
        )

        await watcher.close()

        logger.debug('[WatcherDebug] [CHOKIDAR] CLOSED:', usePolling)

        resolve()
      })

      watcher.on('error', (err) => {
        logger.error('[WatcherDebug] [CHOKIDAR] ERROR:', JSON.stringify(err))

        void watcher.close()
        resolve()
      })
    })
  }

  void (async () => {
    // ==========================================
    // Test 1: usePolling = false
    // ==========================================

    logger.debug('[WatcherDebug] ========== TEST 1: fs.watch ==========')

    await runChokidarTest(false)

    // ==========================================
    // Test 2: usePolling = true
    // ==========================================

    logger.debug('[WatcherDebug] ========== TEST 2: fs.watchFile ==========')

    await runChokidarTest(true)

    logger.debug('[WatcherDebug] ========== END ==========')
  })()
}
