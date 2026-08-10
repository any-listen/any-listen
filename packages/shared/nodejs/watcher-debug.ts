import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import chokidar, { type FSWatcher, type ChokidarOptions } from 'chokidar'

export const watcherDebug = async (logger: AnyListen.Logger, root: string) => {
  const TAG = '[WatcherDiagnostic]'

  // ============================================================
  // 配置
  // ============================================================

  // 目录 / 文件样本最多输出多少个
  const SAMPLE_COUNT = 5

  // Comparison 中最多输出多少个缺失文件
  const MISSING_SAMPLE_COUNT = 10

  // 单个 Chokidar 测试最多等待多久
  const CHOKIDAR_TIMEOUT = 15_000

  // Polling 间隔
  const POLLING_INTERVAL = 1000

  // ============================================================
  // Logger helpers
  // ============================================================

  const debug = (...args: unknown[]) => {
    logger.debug(TAG, ...args)
  }

  const error = (...args: unknown[]) => {
    logger.error(TAG, ...args)
  }

  // ============================================================
  // Command helper
  // ============================================================

  const execCommand = (command: string, args: string[] = [], timeout = 10_000) => {
    try {
      const result = spawnSync(command, args, {
        encoding: 'utf8',
        timeout,
        maxBuffer: 1024 * 1024,
      })

      return {
        command: [command, ...args].join(' '),
        status: result.status,
        signal: result.signal,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        stdout: result.stdout?.trim() ?? '',
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        stderr: result.stderr?.trim() ?? '',
        error: result.error?.message,
      }
    } catch (err) {
      return {
        command: [command, ...args].join(' '),
        status: null,
        signal: null,
        stdout: '',
        stderr: '',
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  const logCommand = (command: string, args: string[] = []) => {
    const result = execCommand(command, args)

    debug('[Command]', JSON.stringify(result))

    return result
  }

  // ============================================================
  // Chokidar watched summary
  // ============================================================

  const summarizeWatched = (watched: Record<string, string[]>) => {
    return Object.fromEntries(
      Object.entries(watched).map(([dir, names]) => [
        dir,
        {
          count: names.length,
          samples: names.slice(0, SAMPLE_COUNT),
        },
      ])
    )
  }

  // ============================================================
  // Start
  // ============================================================

  debug('========== START ==========')

  debug('[Root]', root)

  // ============================================================
  // 1. Environment
  // ============================================================

  debug('========== ENVIRONMENT ==========')

  debug(
    '[Node]',
    JSON.stringify({
      version: process.version,
      versions: process.versions,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      pid: process.pid,
      execPath: process.execPath,
    })
  )

  debug(
    '[OS]',
    JSON.stringify({
      type: os.type(),
      release: os.release(),
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalmem: os.totalmem(),
      freemem: os.freemem(),
    })
  )

  // ============================================================
  // 3. System commands
  // ============================================================

  debug('========== SYSTEM COMMANDS ==========')

  // Kernel
  logCommand('uname', ['-a'])

  // Linux distribution
  logCommand('cat', ['/etc/os-release'])

  // Filesystem
  logCommand('df', ['-T', root])

  // Mount
  logCommand('findmnt', ['-T', root])

  // /proc/mounts
  //
  // 这里不使用 shell，root 会作为 grep 的参数。
  logCommand('grep', [root, '/proc/mounts'])

  // ============================================================
  // 4. Root filesystem
  // ============================================================

  debug('========== FILESYSTEM ==========')

  try {
    let rootExists = fs.existsSync(root)

    debug('[exists]', rootExists)

    if (!rootExists) {
      debug('[Diagnosis]', 'ROOT_NOT_EXISTS')

      debug('========== END ==========')

      return
    }

    const stat = fs.statSync(root)

    debug(
      '[stat]',
      JSON.stringify({
        mode: stat.mode,
        size: stat.size,
        uid: stat.uid,
        gid: stat.gid,
        dev: stat.dev,
        ino: stat.ino,
        nlink: stat.nlink,
        blocks: stat.blocks,
        blksize: stat.blksize,
        birthtime: stat.birthtime,
        mtime: stat.mtime,
        ctime: stat.ctime,
      })
    )

    debug(
      '[stat type]',
      JSON.stringify({
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        isSymbolicLink: stat.isSymbolicLink(),
      })
    )
  } catch (err) {
    error('[stat ERROR]', err instanceof Error ? err.stack : String(err))
  }

  // ============================================================
  // 5. realpath
  // ============================================================

  try {
    debug('[realpath]', fs.realpathSync(root))
  } catch (err) {
    error('[realpath ERROR]', err instanceof Error ? err.stack : String(err))
  }

  // ============================================================
  // 6. Access permission
  // ============================================================

  try {
    fs.accessSync(root, fs.constants.R_OK)

    debug('[access] READ: OK')
  } catch (err) {
    error('[access] READ: FAILED', err instanceof Error ? err.message : String(err))
  }

  try {
    fs.accessSync(root, fs.constants.X_OK)

    debug('[access] EXECUTE: OK')
  } catch (err) {
    error('[access] EXECUTE: FAILED', err instanceof Error ? err.message : String(err))
  }

  // ============================================================
  // 7. Node readdir
  // ============================================================

  debug('========== NODE READDIR ==========')

  let entries: fs.Dirent[] = []

  try {
    entries = fs.readdirSync(root, {
      withFileTypes: true,
    })

    const files = entries.filter((entry) => entry.isFile())

    const directories = entries.filter((entry) => entry.isDirectory())

    const symbolicLinks = entries.filter((entry) => entry.isSymbolicLink())

    debug(
      '[readdir]',
      JSON.stringify({
        total: entries.length,
        files: files.length,
        directories: directories.length,
        symbolicLinks: symbolicLinks.length,

        samples: entries.slice(0, SAMPLE_COUNT).map((entry) => ({
          name: entry.name,
          type: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : entry.isSymbolicLink() ? 'symlink' : 'other',
        })),
      })
    )
  } catch (err) {
    error('[readdir ERROR]', err instanceof Error ? err.stack : String(err))
  }

  // ============================================================
  // 8. File stat
  //
  // 只检查前 3 个文件。
  // ============================================================

  debug('========== NODE FILE STAT ==========')

  const files = entries.filter((entry) => entry.isFile())

  const sampleFiles = files.slice(0, Math.min(3, files.length))

  for (const entry of sampleFiles) {
    const fullPath = path.join(root, entry.name)

    try {
      const stat = fs.statSync(fullPath)

      debug(
        '[file stat]',
        JSON.stringify({
          name: entry.name,
          size: stat.size,
          ino: stat.ino,
          dev: stat.dev,
          mode: stat.mode,
          uid: stat.uid,
          gid: stat.gid,
          mtimeMs: stat.mtimeMs,
        })
      )
    } catch (err) {
      error('[file stat ERROR]', entry.name, err instanceof Error ? err.stack : String(err))
    }
  }

  // ============================================================
  // 9. System command check
  //
  // 只检查一个文件，避免日志过多。
  // ============================================================

  debug('========== FILE COMMAND CHECK ==========')

  if (files.length > 0) {
    const sampleFile = path.join(root, files[0].name)

    debug('[sample file]', sampleFile)

    logCommand('ls', ['-la', sampleFile])

    logCommand('stat', [sampleFile])
  }

  // ============================================================
  // 10. Chokidar test helper
  // ============================================================

  const runChokidarTest = async (
    name: string,
    target: string | string[],
    options: ChokidarOptions,
    timeout = CHOKIDAR_TIMEOUT
  ) => {
    debug(`========== CHOKIDAR TEST: ${name} ==========`)

    debug('[target]', JSON.stringify(target))

    debug('[options]', JSON.stringify(options))

    const events: Array<{
      event: string
      path: string
    }> = []

    const rawEvents: Array<{
      event: string
      path: string
      details?: unknown
    }> = []

    const eventStats = {
      add: 0,
      addDir: 0,
      change: 0,
      unlink: 0,
      unlinkDir: 0,
      other: 0,
    }

    const rawEventStats: Record<string, number> = {}

    let ready = false

    let watcher: FSWatcher | undefined

    try {
      watcher = chokidar.watch(target, options)

      // --------------------------------------------------------
      // all event
      //
      // 不逐条输出，只统计。
      // --------------------------------------------------------

      watcher.on('all', (event, filePath) => {
        if (event === 'add' || event === 'addDir' || event === 'change' || event === 'unlink' || event === 'unlinkDir') {
          eventStats[event]++
        } else {
          eventStats.other++
        }

        // 只保留前几个样本
        if (events.length < SAMPLE_COUNT) {
          events.push({
            event,
            path: filePath,
          })
        }
      })

      // --------------------------------------------------------
      // raw event
      //
      // raw 事件可能非常多，因此也只统计。
      // --------------------------------------------------------

      watcher.on('raw', (event, filePath, details) => {
        rawEventStats[event] = (rawEventStats[event] ?? 0) + 1

        if (rawEvents.length < SAMPLE_COUNT) {
          rawEvents.push({
            event,
            path: filePath,
            details,
          })
        }
      })

      // --------------------------------------------------------
      // error
      // --------------------------------------------------------

      watcher.on('error', (err) => {
        error(`[CHOKIDAR][${name}][ERROR]`, err instanceof Error ? err.stack : String(err))
      })

      // --------------------------------------------------------
      // ready
      // --------------------------------------------------------

      await new Promise<void>((resolve) => {
        let resolved = false

        const finish = () => {
          if (resolved) {
            return
          }

          resolved = true
          resolve()
        }

        watcher!.on('ready', () => {
          ready = true

          finish()
        })

        setTimeout(() => {
          if (!ready) {
            debug(`[CHOKIDAR][${name}] TIMEOUT`)
          }

          finish()
        }, timeout)
      })

      // 给 polling 一次额外扫描机会
      await new Promise((resolve) => {
        setTimeout(resolve, 1500)
      })

      let watched: Record<string, string[]> = {}

      try {
        watched = watcher.getWatched()
      } catch (err) {
        error(`[CHOKIDAR][${name}][getWatched ERROR]`, err instanceof Error ? err.stack : String(err))
      }

      // --------------------------------------------------------
      // 输出结果
      // --------------------------------------------------------

      debug(
        `[CHOKIDAR][${name}][RESULT]`,
        JSON.stringify({
          ready,

          eventStats,

          eventSamples: events,

          rawEventStats,

          rawEventSamples: rawEvents,

          watched: summarizeWatched(watched),
        })
      )

      return {
        ready,
        events,
        rawEvents,
        eventStats,
        rawEventStats,
        watched,
      }
    } catch (err) {
      error(`[CHOKIDAR][${name}][EXCEPTION]`, err instanceof Error ? err.stack : String(err))

      return {
        ready,
        events,
        rawEvents,
        eventStats,
        rawEventStats,
        watched: {},
      }
    } finally {
      if (watcher) {
        try {
          await watcher.close()

          debug(`[CHOKIDAR][${name}] CLOSED`)
        } catch (err) {
          error(`[CHOKIDAR][${name}][CLOSE ERROR]`, err instanceof Error ? err.stack : String(err))
        }
      }
    }
  }

  // ============================================================
  // 11. Test A
  //
  // 普通 Chokidar，不使用 polling。
  // ============================================================

  const normalResult = await runChokidarTest('A_NORMAL', root, {
    persistent: true,
    ignoreInitial: false,
  })

  // ============================================================
  // 12. Test B
  //
  // Polling。
  // ============================================================

  const pollingResult = await runChokidarTest('B_POLLING', root, {
    persistent: true,
    ignoreInitial: false,
    usePolling: true,
    interval: POLLING_INTERVAL,
    binaryInterval: POLLING_INTERVAL,
  })

  // ============================================================
  // 13. Test C
  //
  // 直接 watch 一个确定存在的文件。
  // ============================================================

  let directFileResult: Awaited<ReturnType<typeof runChokidarTest>> | undefined

  if (files.length > 0) {
    const file = path.join(root, files[0].name)

    directFileResult = await runChokidarTest('C_DIRECT_FILE', file, {
      persistent: true,
      ignoreInitial: false,
      usePolling: true,
      interval: POLLING_INTERVAL,
      binaryInterval: POLLING_INTERVAL,
    })
  } else {
    debug('[C_DIRECT_FILE] SKIPPED: no regular files')
  }

  // ============================================================
  // 14. Test D
  //
  // 把 fs.readdirSync 得到的文件直接交给 Chokidar。
  //
  // 文件很多时也没有问题，因为这里不输出文件列表。
  // ============================================================

  let directFilesResult: Awaited<ReturnType<typeof runChokidarTest>> | undefined

  const directFilePaths = files.map((entry) => path.join(root, entry.name))

  if (directFilePaths.length > 0) {
    directFilesResult = await runChokidarTest('D_DIRECT_FILES', directFilePaths, {
      persistent: true,
      ignoreInitial: false,
      usePolling: true,
      interval: POLLING_INTERVAL,
      binaryInterval: POLLING_INTERVAL,
    })
  } else {
    debug('[D_DIRECT_FILES] SKIPPED: no regular files')
  }

  // ============================================================
  // 15. Comparison
  // ============================================================

  debug('========== COMPARISON ==========')

  const expectedNames = new Set(files.map((file) => file.name))

  const getWatchedFileNames = (watched: Record<string, string[]>) => {
    const result = new Set<string>()

    for (const names of Object.values(watched)) {
      for (const name of names) {
        result.add(name)
      }
    }

    return result
  }

  const normalWatchedNames = getWatchedFileNames(normalResult.watched)

  const pollingWatchedNames = getWatchedFileNames(pollingResult.watched)

  const missingNormal = [...expectedNames].filter((name) => !normalWatchedNames.has(name))

  const missingPolling = [...expectedNames].filter((name) => !pollingWatchedNames.has(name))

  debug(
    '[Comparison]',
    JSON.stringify({
      fsFileCount: expectedNames.size,

      normalWatchedFileCount: normalWatchedNames.size,

      pollingWatchedFileCount: pollingWatchedNames.size,

      normalMissingCount: missingNormal.length,

      pollingMissingCount: missingPolling.length,

      normalMissingSamples: missingNormal.slice(0, MISSING_SAMPLE_COUNT),

      pollingMissingSamples: missingPolling.slice(0, MISSING_SAMPLE_COUNT),
    })
  )

  // ============================================================
  // 16. Diagnosis
  // ============================================================

  debug('========== DIAGNOSIS ==========')

  const normalHasAdd = normalResult.eventStats.add > 0

  const pollingHasAdd = pollingResult.eventStats.add > 0

  const directFileHasAdd = directFileResult?.eventStats.add === 1

  const directFilesAddCount = directFilesResult?.eventStats.add ?? 0

  if (files.length === 0) {
    debug('[Diagnosis]', 'ROOT_EMPTY_OR_NO_REGULAR_FILES')
  } else if (normalHasAdd && pollingHasAdd) {
    debug('[Diagnosis]', 'CHOKIDAR_INITIAL_SCAN_OK')
  } else if (!normalHasAdd && !pollingHasAdd && directFileHasAdd) {
    debug('[Diagnosis]', 'DIRECT_FILE_WATCH_OK_BUT_DIRECTORY_SCAN_FAILED')
  } else if (!normalHasAdd && !pollingHasAdd && directFilesAddCount > 0) {
    debug('[Diagnosis]', 'EXPLICIT_FILE_LIST_WATCH_OK_BUT_RECURSIVE_SCAN_FAILED')
  } else if (!normalHasAdd && !pollingHasAdd && !directFileHasAdd) {
    debug('[Diagnosis]', 'CHOKIDAR_CANNOT_WATCH_DIRECT_FILE')
  } else if (!normalHasAdd && pollingHasAdd) {
    debug('[Diagnosis]', 'POLLING_WORKS_BUT_NATIVE_WATCH_FAILED')
  } else {
    debug('[Diagnosis]', 'UNDETERMINED_CHECK_FILESYSTEM_MOUNT_AND_VERSIONS')
  }

  // ============================================================
  // 17. Summary
  //
  // 最后再输出一条高度压缩的总结，方便搜索日志。
  // ============================================================

  debug(
    '[SUMMARY]',
    JSON.stringify({
      root,

      fsFiles: files.length,

      normal: {
        ready: normalResult.ready,
        add: normalResult.eventStats.add,
        addDir: normalResult.eventStats.addDir,
        watchedFiles: normalWatchedNames.size,
      },

      polling: {
        ready: pollingResult.ready,
        add: pollingResult.eventStats.add,
        addDir: pollingResult.eventStats.addDir,
        watchedFiles: pollingWatchedNames.size,
      },

      directFile: {
        tested: Boolean(directFileResult),
        add: directFileResult?.eventStats.add ?? 0,
      },

      directFiles: {
        tested: Boolean(directFilesResult),
        add: directFilesResult?.eventStats.add ?? 0,
      },
    })
  )

  debug('========== END ==========')
}
