import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'

import { readdirp } from 'readdirp'

export const watcherDebug = async (logger: AnyListen.Logger, root: string) => {
  const TAG = '[WatcherDiagnostic]'

  // ============================================================
  // 配置
  // ============================================================

  // 日志中最多输出多少个文件样本
  const SAMPLE_COUNT = 5

  // readdirp 单次测试超时时间
  const READDIRP_TIMEOUT = 30_000

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

  logCommand('uname', ['-a'])

  logCommand('cat', ['/etc/os-release'])

  logCommand('df', ['-T', root])

  logCommand('findmnt', ['-T', root])

  logCommand('grep', [root, '/proc/mounts'])

  // ============================================================
  // 4. Root filesystem
  // ============================================================

  debug('========== FILESYSTEM ==========')

  try {
    const exists = fs.existsSync(root)

    debug('[exists]', exists)

    if (!exists) {
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
  //
  // 这是对照组。
  //
  // 如果这里能看到文件，而 readdirp 看不到，
  // 问题就可以进一步缩小到 readdirp / recursive traversal。
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

  const directFiles = entries.filter((entry) => entry.isFile())

  const directFileCount = directFiles.length

  // ============================================================
  // 8. readdirp test helper
  // ============================================================

  const runReaddirpTest = async (name: string, options: Parameters<typeof readdirp>[1]) => {
    debug(`========== READDIRP TEST: ${name} ==========`)

    debug('[options]', JSON.stringify(options))

    let fileCount = 0
    let directoryCount = 0
    let otherCount = 0

    const fileSamples: Array<{
      path: string
      fullPath?: string
      basename?: string
    }> = []

    const directorySamples: Array<{
      path: string
      fullPath?: string
    }> = []

    let stream: ReturnType<typeof readdirp>

    try {
      stream = readdirp(root, options)
    } catch (err) {
      error(`[READDIRP][${name}] CREATE ERROR`, err instanceof Error ? err.stack : String(err))

      return {
        success: false,
        fileCount: 0,
        directoryCount: 0,
        otherCount: 0,
        fileSamples,
        directorySamples,
        error: err instanceof Error ? err.message : String(err),
      }
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`readdirp timeout after ${READDIRP_TIMEOUT}ms`))
        }, READDIRP_TIMEOUT)
      })

      const consumePromise = (async () => {
        for await (const entry of stream) {
          if (entry.dirent.isFile()) {
            fileCount++

            if (fileSamples.length < SAMPLE_COUNT) {
              fileSamples.push({
                path: entry.path,
                fullPath: entry.fullPath,
                basename: entry.basename,
              })
            }
          } else if (entry.dirent.isDirectory()) {
            directoryCount++

            if (directorySamples.length < SAMPLE_COUNT) {
              directorySamples.push({
                path: entry.path,
                fullPath: entry.fullPath,
              })
            }
          } else {
            otherCount++
          }
        }
      })()

      await Promise.race([consumePromise, timeoutPromise])

      debug(
        `[READDIRP][${name}][RESULT]`,
        JSON.stringify({
          success: true,

          fileCount,

          directoryCount,

          otherCount,

          fileSamples,

          directorySamples,
        })
      )

      return {
        success: true,
        fileCount,
        directoryCount,
        otherCount,
        fileSamples,
        directorySamples,
      }
    } catch (err) {
      error(
        `[READDIRP][${name}][ERROR]`,
        JSON.stringify({
          message: err instanceof Error ? err.message : String(err),

          fileCount,

          directoryCount,

          otherCount,

          fileSamples,

          directorySamples,
        })
      )

      try {
        stream.destroy()
      } catch {
        // ignore
      }

      return {
        success: false,
        fileCount,
        directoryCount,
        otherCount,
        fileSamples,
        directorySamples,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  // ============================================================
  // 9. readdirp test A
  //
  // 最接近 chokidar 默认递归扫描的行为：
  // 只查文件和目录，不使用过滤器。
  // ============================================================

  const recursiveResult = await runReaddirpTest('A_RECURSIVE', {
    type: 'files_directories',
  })

  // ============================================================
  // 10. readdirp test B
  //
  // 只扫描文件。
  //
  // 如果 A 正常、B 正常：
  // readdirp 基本递归扫描没有问题。
  // ============================================================

  const filesOnlyResult = await runReaddirpTest('B_FILES_ONLY', {
    type: 'files',
  })

  // ============================================================
  // 11. readdirp test C
  //
  // 限制深度为 1。
  //
  // root 本身就是目标目录，所以这里可以验证：
  // readdirp 是否能读取 root 的直接子文件。
  // ============================================================

  const depthOneResult = await runReaddirpTest('C_DEPTH_ONE', {
    type: 'files',
    depth: 1,
  })

  // ============================================================
  // 12. readdirp test D
  //
  // 显式使用 root 下的文件扩展名过滤。
  //
  // 音乐目录场景下用于确认过滤器是否影响结果。
  // ============================================================

  const extensionResult = await runReaddirpTest('D_EXTENSION_FILTER', {
    type: 'files',
    directoryFilter: ['!@eaDir'],
    fileFilter: ['*.mp3', '*.flac', '*.m4a', '*.aac', '*.ogg', '*.wav', '*.opus'],
  })

  // ============================================================
  // 13. Comparison
  // ============================================================

  debug('========== COMPARISON ==========')

  debug(
    '[Comparison]',
    JSON.stringify({
      nodeReaddirFiles: directFileCount,

      readdirpRecursiveFiles: recursiveResult.fileCount,

      readdirpFilesOnly: filesOnlyResult.fileCount,

      readdirpDepthOne: depthOneResult.fileCount,

      readdirpExtensionFilter: extensionResult.fileCount,

      recursiveDifference: directFileCount - recursiveResult.fileCount,

      filesOnlyDifference: directFileCount - filesOnlyResult.fileCount,

      depthOneDifference: directFileCount - depthOneResult.fileCount,
    })
  )

  // ============================================================
  // 14. Diagnosis
  // ============================================================

  debug('========== DIAGNOSIS ==========')

  // ------------------------------------------------------------
  // 情况 1：
  //
  // Node readdir 能看到文件
  // readdirp recursive 也能看到文件
  //
  // 那么 readdirp 本身基本正常。
  // ------------------------------------------------------------

  if (directFileCount > 0 && recursiveResult.success && recursiveResult.fileCount > 0) {
    debug('[Diagnosis]', 'READDIRP_RECURSIVE_SCAN_OK')
  }

  // ------------------------------------------------------------
  // 情况 2：
  //
  // Node readdir 能看到文件
  // readdirp recursive 看不到文件
  // ------------------------------------------------------------
  else if (directFileCount > 0 && recursiveResult.success && recursiveResult.fileCount === 0) {
    debug('[Diagnosis]', 'NODE_READDIR_OK_BUT_READDIRP_RECURSIVE_SCAN_FAILED')
  }

  // ------------------------------------------------------------
  // 情况 3：
  //
  // readdirp recursive 失败，但是 files-only 正常。
  //
  // 说明可能和目录 traversal 有关。
  // ------------------------------------------------------------
  else if (!recursiveResult.success && filesOnlyResult.success && filesOnlyResult.fileCount > 0) {
    debug('[Diagnosis]', 'READDIRP_RECURSIVE_ERROR_BUT_FILES_ONLY_WORKS')
  }

  // ------------------------------------------------------------
  // 情况 4：
  //
  // depth=1 正常，但是 recursive 失败。
  //
  // 进一步指向 recursive traversal。
  // ------------------------------------------------------------
  else if (depthOneResult.fileCount > 0 && recursiveResult.fileCount === 0) {
    debug('[Diagnosis]', 'READDIRP_DEPTH_ONE_OK_BUT_RECURSIVE_SCAN_FAILED')
  }

  // ------------------------------------------------------------
  // 情况 5：
  //
  // readdirp 全部无法发现文件。
  // ------------------------------------------------------------
  else if (
    directFileCount > 0 &&
    recursiveResult.fileCount === 0 &&
    filesOnlyResult.fileCount === 0 &&
    depthOneResult.fileCount === 0
  ) {
    debug('[Diagnosis]', 'NODE_READDIR_OK_BUT_READDIRP_CANNOT_DISCOVER_FILES')
  }

  // ------------------------------------------------------------
  // 其他
  // ------------------------------------------------------------
  else {
    debug('[Diagnosis]', 'UNDETERMINED_CHECK_READDIRP_ERRORS_AND_FILESYSTEM')
  }

  // ============================================================
  // 15. Summary
  // ============================================================

  debug(
    '[SUMMARY]',
    JSON.stringify({
      root,

      nodeReaddirFiles: directFileCount,

      readdirp: {
        version: 'see PACKAGE VERSIONS',

        recursive: {
          success: recursiveResult.success,
          files: recursiveResult.fileCount,
        },

        filesOnly: {
          success: filesOnlyResult.success,
          files: filesOnlyResult.fileCount,
        },

        depthOne: {
          success: depthOneResult.success,
          files: depthOneResult.fileCount,
        },

        extensionFilter: {
          success: extensionResult.success,
          files: extensionResult.fileCount,
        },
      },
    })
  )

  debug('========== END ==========')
}
