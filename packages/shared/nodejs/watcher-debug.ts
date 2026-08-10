import fs from 'node:fs'

import chokidar from 'chokidar'

export const watcherDebug = (logger: AnyListen.Logger, root: string) => {
  logger.debug('[WatcherDebug] path:', root)
  logger.debug('[WatcherDebug] exists:', fs.existsSync(root))
  logger.debug('[WatcherDebug] stat:', JSON.stringify(fs.statSync(root)))

  logger.debug(
    '[WatcherDebug] readdir:',
    fs
      .readdirSync(root, {
        withFileTypes: true,
      })
      .map((x) => ({
        name: x.name,
        isFile: x.isFile(),
        isDirectory: x.isDirectory(),
        isSymbolicLink: x.isSymbolicLink(),
      }))
  )

  const watcher = chokidar.watch(root, {
    persistent: true,
    ignoreInitial: false,
    usePolling: true,
    interval: 1000,
    depth: undefined,
  })

  watcher.on('all', (event, filePath) => {
    logger.debug('[WatcherDebug] [CHOKIDAR]', event, filePath)
  })

  watcher.on('ready', () => {
    logger.debug('[WatcherDebug] [CHOKIDAR] READY')

    logger.debug('[WatcherDebug] watched:', JSON.stringify(watcher.getWatched()))
    void watcher.close()
  })

  watcher.on('error', (err) => {
    logger.error('[WatcherDebug] [CHOKIDAR] ERROR', err)
  })
}
