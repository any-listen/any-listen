import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

import { buildMusicCacheId, buildMusicName, getFileType } from '@any-listen/common/tools'
import type { Message, TranslateValues } from '@any-listen/i18n'
import { toSha256 } from '@any-listen/nodejs'
import { createDownload, type DownloaderType } from '@any-listen/nodejs/download'
import { buildDownloadName, isPathInside, prepareDownloadDirectory } from '@any-listen/nodejs/download/path'

import type { DBSeriveTypes } from '../worker/utils'
import { prepareDownloadLyric } from './lyric'

export interface Options {
  dbService: Pick<
    DBSeriveTypes,
    'getDownloadList' | 'downloadInfoSave' | 'downloadInfoUpdate' | 'downloadInfoRemove' | 'downloadInfoClear'
  >
  getSettings: () => AnyListen.AppSetting
  getMusicUrl: (info: AnyListen.IPCMusic.GetMusicUrlInfo) => Promise<AnyListen.IPCMusic.MusicUrlInfo>
  getLyricInfo?: (info: AnyListen.IPCMusic.GetMusicPicInfo) => Promise<AnyListen.IPCMusic.MusicLyricInfo>
  createLocalMusicInfos?: (paths: string[]) => Promise<AnyListen.Music.MusicInfoLocal[]>
  resolveUrl: (url: string) => string
  checkPath: (directory: string) => Promise<void>
  translate: (key: keyof Message, values?: TranslateValues) => string
  onAction: (action: AnyListen.Download.ListAction) => void
  onError: (err: unknown) => void
}

class Cancelled extends Error {}
interface Runtime {
  valid: boolean
  committing: boolean
  downloader?: DownloaderType
  done: Promise<void>
  cancelled: Promise<never>
  cancel: () => void
  persistenceError?: unknown
}

export const createDownloadService = (options: Options) => {
  let list: AnyListen.Download.ListItem[] = []
  let revision = 0
  let operations = Promise.resolve()
  let writes = Promise.resolve()
  let progressTimer: NodeJS.Timeout | undefined
  const active = new Map<string, Runtime>()
  const dirty = new Map<string, { item: AnyListen.Download.ListItem; runtime: Runtime }>()
  const refreshUrls = new Set<string>()
  const publications = new Map<string, Promise<void>>()
  const t = options.translate
  const copy = (item: AnyListen.Download.ListItem) => structuredClone(item)
  const settingsSnapshot = (): AnyListen.Download.Settings => {
    const settings = options.getSettings()
    return {
      'download.skipExistFile': settings['download.skipExistFile'],
      'download.isDownloadLrc': settings['download.isDownloadLrc'],
      'download.isDownloadLxLrc': settings['download.isDownloadLxLrc'],
      'download.isDownloadTLrc': settings['download.isDownloadTLrc'],
      'download.isDownloadRLrc': settings['download.isDownloadRLrc'],
      'download.lrcFormat': settings['download.lrcFormat'],
    }
  }
  const taskMeta = (item: AnyListen.Download.ListItem) => item.metadata.task!
  const emit = (
    action:
      | Omit<Extract<AnyListen.Download.ListAction, { action: 'update' }>, 'revision'>
      | Omit<Extract<AnyListen.Download.ListAction, { action: 'add' }>, 'revision'>
      | Omit<Extract<AnyListen.Download.ListAction, { action: 'remove' }>, 'revision'>
      | { action: 'clear' }
  ) => {
    const next = { ...action, revision: ++revision }
    options.onAction(next)
  }
  const serializeWrite = <T>(action: () => Promise<T>): Promise<T> => {
    const result = writes.then(action)
    writes = result.then(
      () => {},
      () => {}
    )
    return result
  }
  const exclusive = <T>(action: () => Promise<T>): Promise<T> => {
    const result = operations.then(action)
    operations = result.then(
      () => {},
      () => {}
    )
    return result
  }
  const save = (item: AnyListen.Download.ListItem) => {
    const snapshot = copy(item)
    return serializeWrite(async () => {
      await options.dbService.downloadInfoUpdate([snapshot])
      emit({ action: 'update', data: [snapshot] })
    })
  }
  const checkActive = (runtime: Runtime) => {
    if (!runtime.valid) throw new Cancelled()
    if (runtime.persistenceError) throw runtime.persistenceError
  }
  const resource = <T>(promise: Promise<T>, runtime: Runtime) => Promise.race([promise, runtime.cancelled])
  const flushProgress = async () => {
    if (progressTimer) clearTimeout(progressTimer)
    progressTimer = undefined
    const pending = [...dirty.values()].filter(({ runtime }) => runtime.valid)
    dirty.clear()
    if (!pending.length) return
    const snapshots = pending.map(({ item }) => copy(item))
    await serializeWrite(async () => {
      await options.dbService.downloadInfoUpdate(snapshots)
      emit({ action: 'update', data: snapshots })
    }).catch((err: unknown) => {
      for (const { runtime } of pending) runtime.persistenceError = err
      options.onError(err)
    })
  }
  const progress = (item: AnyListen.Download.ListItem, runtime: Runtime, info: AnyListen.Download.ProgressInfo) => {
    if (!runtime.valid) return
    Object.assign(item, info, { progress: Math.min(99.99, info.progress) })
    dirty.set(item.id, { item, runtime })
    progressTimer ??= setTimeout(() => {
      void flushProgress().catch(options.onError)
    }, 150)
  }
  const buildFilePath = (directory: string, fileName: string) => {
    const target = path.join(directory, fileName)
    if (!isPathInside(directory, target) || target === directory) throw new Error('Invalid download file path')
    return target
  }
  const partPath = (item: AnyListen.Download.ListItem) =>
    buildFilePath(path.dirname(item.metadata.filePath), `.anylisten-${toSha256(item.id)}.part`)
  const statFile = async (filePath: string) =>
    fs.lstat(filePath).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== 'ENOENT') throw err
      return undefined
    })
  const removeTemporary = async (filePath: string) => {
    await options.checkPath(path.dirname(filePath))
    const stat = await statFile(filePath)
    if (!stat) return
    if (!stat.isFile()) throw new Error('Invalid download temporary file')
    await fs.unlink(filePath)
  }
  const cleanAuxiliary = async (item: AnyListen.Download.ListItem, removePart = false) => {
    const part = partPath(item)
    for (const file of [part + '.lrc', ...(removePart ? [part] : [])]) {
      await removeTemporary(file)
    }
  }
  const hasCompletedFile = async (item: AnyListen.Download.ListItem) => {
    if (!item.isComplate || item.status !== 'completed' || !item.total) return false
    await options.checkPath(path.dirname(item.metadata.filePath))
    const stat = await statFile(item.metadata.filePath)
    return !!stat?.isFile() && stat.size === item.total
  }
  const downloadFile = (item: AnyListen.Download.ListItem, runtime: Runtime, rawUrl: string, target: string) => {
    checkActive(runtime)
    const url = options.resolveUrl(rawUrl)
    if (!/^https?:\/\//i.test(url)) throw new Error(t('download.invalid_url'))
    const setting = options.getSettings()
    return resource(
      new Promise<void>((resolve, reject) => {
        const dl = createDownload({
          url,
          path: target,
          proxy:
            setting['network.proxy.enable'] && url === rawUrl
              ? { host: setting['network.proxy.host'], port: Number(setting['network.proxy.port']) }
              : undefined,
          onCompleted: resolve,
          onStop: () => reject(new Cancelled()),
          onError: reject,
          onFail: (resp) =>
            reject(Object.assign(new Error(`HTTP ${resp.statusCode}: ${resp.statusMessage}`), { statusCode: resp.statusCode })),
          onProgress: (info) => progress(item, runtime, info),
        })
        runtime.downloader = dl
      }),
      runtime
    )
  }
  const publish = async (input: string, target: string, skip: boolean) => {
    await options.checkPath(path.dirname(target))
    const existing = await statFile(target)
    if (existing && (skip || !existing.isFile())) throw new Error(t('download.file_exists'))
    if (!skip) {
      await fs.rename(input, target)
      return
    }
    try {
      await fs.link(input, target)
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      if (code === 'EEXIST') throw new Error(t('download.file_exists'))
      if (!['ENOSYS', 'ENOTSUP', 'EOPNOTSUPP', 'EPERM', 'EXDEV'].includes(code ?? '')) throw err
      // Exclusive destination creation also works on FAT/network filesystems.
      const file = await fs.open(target, 'wx').catch((err: NodeJS.ErrnoException) => {
        if (err.code === 'EEXIST') throw new Error(t('download.file_exists'))
        throw err
      })
      const created = await file.stat()
      try {
        // Write through the exclusively created descriptor; reopening the path
        // would allow a replacement symlink to redirect the copy elsewhere.
        await pipeline(createReadStream(input), file.createWriteStream())
        await options.checkPath(path.dirname(target))
        const published = await fs.lstat(target)
        if (!published.isFile() || published.ino !== created.ino || published.dev !== created.dev) {
          throw new Error('Download destination changed during publication')
        }
      } catch (copyError) {
        await file.close().catch(() => {})
        const current = await statFile(target)
        if (current?.ino === created.ino && current.dev === created.dev) await fs.unlink(target).catch(options.onError)
        throw copyError
      }
    }
  }
  const withPublication = async (target: string, action: () => Promise<void>) => {
    const previous = publications.get(target) ?? Promise.resolve()
    const result = previous.catch(() => {}).then(action)
    publications.set(target, result)
    try {
      await result
    } finally {
      if (publications.get(target) === result) publications.delete(target)
    }
  }
  const fetchAudio = async (item: AnyListen.Download.ListItem, runtime: Runtime, part: string) => {
    const task = taskMeta(item)
    let refresh = refreshUrls.delete(item.id)
    for (let attempt = 0; ; attempt++) {
      checkActive(runtime)
      await options.checkPath(path.dirname(part))
      const partial = await statFile(part)
      if (partial && (!partial.isFile() || partial.nlink !== 1)) throw new Error('Invalid download temporary file')
      checkActive(runtime)
      if (!item.metadata.url || refresh) {
        item.statusText = t('download.resolving_url')
        await save(item)
        checkActive(runtime)
        const info = await resource(
          options.getMusicUrl({
            musicInfo: structuredClone(item.metadata.musicInfo),
            quality: task.requestedQuality,
            isRefresh: refresh,
          }),
          runtime
        )
        checkActive(runtime)
        item.metadata.url = info.url
        item.metadata.quality = info.quality
        item.metadata.ext = getFileType(info.quality)
        item.metadata.fileName = `${path.parse(item.metadata.fileName).name}.${item.metadata.ext}`
        item.metadata.filePath = buildFilePath(path.dirname(part), item.metadata.fileName)
        refresh = false
      }
      const existing = await statFile(item.metadata.filePath)
      checkActive(runtime)
      if (existing && task.settings['download.skipExistFile']) throw new Error(t('download.file_exists'))
      item.statusText = attempt ? t('download.retrying', { count: attempt }) : ''
      await save(item)
      try {
        await downloadFile(item, runtime, item.metadata.url, part)
        await flushProgress()
        checkActive(runtime)
        return
      } catch (err) {
        checkActive(runtime)
        const { code, statusCode } = err as NodeJS.ErrnoException & { statusCode?: number }
        const transient =
          ['ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'EPIPE'].includes(code ?? '') ||
          [401, 403, 404, 408, 410, 429, 500, 502, 503, 504].includes(statusCode ?? 0) ||
          /timeout|aborted|Connection closed|terminated|Invalid resume response/i.test((err as Error).message)
        if (attempt >= 2 || !transient) throw err
        refresh = code === 'ENOTFOUND' || [401, 403, 404, 410].includes(statusCode ?? 0)
        item.statusText = t('download.retrying', { count: attempt + 1 })
        await save(item)
        await resource(
          new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 1000)
            void runtime.cancelled.catch(() => {
              clearTimeout(timer)
            })
          }),
          runtime
        )
      }
    }
  }
  const run = async (item: AnyListen.Download.ListItem, runtime: Runtime) => {
    const part = partPath(item)
    try {
      item.statusText = t('download.resolving_url')
      await save(item)
      checkActive(runtime)
      await prepareDownloadDirectory(path.dirname(part), options.checkPath)
      checkActive(runtime)
      await cleanAuxiliary(item)
      const existing = await statFile(part)
      if (existing && (!existing.isFile() || existing.nlink !== 1)) throw new Error('Invalid download temporary file')
      checkActive(runtime)
      await fetchAudio(item, runtime, part)
      await options.checkPath(path.dirname(part))
      const stat = await fs.stat(part)
      if (!stat.size || (item.total && stat.size !== item.total)) throw new Error(t('download.incomplete_file'))
      checkActive(runtime)
      if (taskMeta(item).settings['download.isDownloadLrc']) {
        item.statusText = t('download.processing_lyric')
        await save(item)
      }
      const lyricOptions: Options = {
        ...options,
        getLyricInfo: options.getLyricInfo
          ? (info) => resource(options.getLyricInfo!(structuredClone(info)), runtime)
          : undefined,
      }
      const prepared = await prepareDownloadLyric(item, part, lyricOptions, () => checkActive(runtime))
      checkActive(runtime)
      await withPublication(item.metadata.filePath, async () => {
        checkActive(runtime)
        // Once publication starts, pause waits for this short commit instead of
        // leaving a published file attached to a paused task.
        runtime.committing = true
        await publish(part, item.metadata.filePath, taskMeta(item).settings['download.skipExistFile'])
        if (prepared.lyricPath) {
          try {
            await publish(
              prepared.lyricPath,
              item.metadata.filePath.replace(/\.[^.]+$/, '.lrc'),
              taskMeta(item).settings['download.skipExistFile']
            )
          } catch (err) {
            options.onError(err)
            prepared.warnings.push(t('download.lyric_warning', { error: err instanceof Error ? err.message : String(err) }))
          }
        }
        const finalStat = await fs.stat(item.metadata.filePath)
        if (finalStat.size !== stat.size) throw new Error(t('download.incomplete_file'))
        await cleanAuxiliary(item, true).catch((err: unknown) => {
          options.onError(err)
          prepared.warnings.push(t('download.cleanup_warning', { error: err instanceof Error ? err.message : String(err) }))
        })
        const completed: AnyListen.Download.ListItem = {
          ...copy(item),
          status: 'completed',
          isComplate: true,
          progress: 100,
          downloaded: finalStat.size,
          total: finalStat.size,
          speed: '',
          writeQueue: 0,
          statusText: prepared.warnings.join('\n'),
        }
        await save(completed)
        Object.assign(item, completed)
      })
    } catch (err) {
      await flushProgress()
      if (err instanceof Cancelled || !runtime.valid) return
      item.status = 'error'
      item.isComplate = false
      item.speed = ''
      item.writeQueue = 0
      item.statusText = err instanceof Error ? err.message : String(err)
      options.onError(err)
      await save(item).catch((saveError: unknown) => {
        item.statusText += `; ${t('download.save_failed')}`
        options.onError(saveError)
        emit({ action: 'update', data: [copy(item)] })
      })
    } finally {
      if (!runtime.valid) await runtime.downloader?.stop().catch(options.onError)
      dirty.delete(item.id)
      await cleanAuxiliary(item).catch(options.onError)
    }
  }
  const startQueue = () => {
    const settings = options.getSettings()
    if (!settings['download.enable']) return
    const max = settings['download.maxDownloadNum']
    while (active.size < max) {
      const item = list.find((task) => task.status === 'waiting' && !active.has(task.id))
      if (!item) break
      let cancel!: () => void
      const cancelled = new Promise<never>((_, reject) => {
        cancel = () => reject(new Cancelled())
      })
      void cancelled.catch(() => {})
      const runtime: Runtime = { valid: true, committing: false, cancelled, cancel, done: Promise.resolve() }
      active.set(item.id, runtime)
      item.status = 'run'
      runtime.done = run(item, runtime)
        .catch(options.onError)
        .finally(() => {
          active.delete(item.id)
          startQueue()
        })
    }
  }
  const stop = async (item: AnyListen.Download.ListItem) => {
    const runtime = active.get(item.id)
    if (!runtime) return
    if (!runtime.committing) {
      runtime.valid = false
      runtime.cancel()
      dirty.delete(item.id)
      await runtime.downloader?.stop()
    }
    await runtime.done
    await writes
  }
  const start = async (item: AnyListen.Download.ListItem) => {
    if (item.status === 'run' || item.status === 'waiting') return
    if (await hasCompletedFile(item)) return
    const waiting = { ...copy(item), status: 'waiting' as const, isComplate: false, statusText: '', speed: '', writeQueue: 0 }
    if (item.status === 'error') {
      waiting.metadata.url = null
      refreshUrls.add(item.id)
    }
    await save(waiting)
    Object.assign(item, waiting)
  }
  const selected = (ids: string[]) => {
    const unique = new Set(ids)
    const tasks = list.filter((item) => unique.has(item.id))
    if (tasks.length !== unique.size) throw new Error(t('download.task_not_found'))
    return tasks
  }

  return {
    async init() {
      list = await options.dbService.getDownloadList()
      const defaults = settingsSnapshot()
      for (const item of list) {
        const previous = item.metadata.task
        item.metadata.task = {
          requestedQuality: previous?.requestedQuality ?? item.metadata.quality,
          settings: Object.fromEntries(
            Object.entries(defaults).map(([key, value]) => [
              key,
              previous?.settings?.[key as keyof AnyListen.Download.Settings] ?? value,
            ])
          ) as AnyListen.Download.Settings,
        }
        if (item.status === 'run' || item.status === 'waiting') {
          item.status = 'pause'
          item.isComplate = false
          item.statusText = t('download.interrupted')
          item.speed = ''
          item.writeQueue = 0
          await save(item)
        }
      }
    },
    settingsChanged: startQueue,
    async getDownloadSnapshot(): Promise<AnyListen.Download.Snapshot> {
      await operations
      await writes
      return { list: list.map(copy), revision }
    },
    downloadMusic(musicInfos: AnyListen.Music.MusicInfo[], submit: AnyListen.Download.SubmitOptions = {}) {
      return exclusive(async (): Promise<AnyListen.Download.SubmitResult> => {
        const result: AnyListen.Download.SubmitResult = { taskIds: [], skipped: [] }
        const settings = options.getSettings()
        if (!musicInfos.some((music) => !music.isLocal)) {
          result.skipped = musicInfos.map((music) => ({ musicId: music.id, reason: t('download.local_skipped') }))
          return result
        }
        if (!settings['download.enable']) throw new Error(t('download.disabled'))
        if (!settings['download.savePath']) throw new Error(t('download.select_directory'))
        const quality = submit.quality ?? settings['player.playQuality']
        if (typeof quality !== 'string' || !quality.trim() || quality.length > 128) throw new Error(t('download.invalid_quality'))
        const directory = await prepareDownloadDirectory(
          settings['download.isSavePathGroupByListName']
            ? path.join(settings['download.savePath'], buildDownloadName(submit.listName || t('download.default_group')))
            : settings['download.savePath'],
          options.checkPath
        )
        const created: AnyListen.Download.ListItem[] = []
        for (const musicInfo of musicInfos) {
          if (musicInfo.isLocal) {
            result.skipped.push({ musicId: musicInfo.id, reason: t('download.local_skipped') })
            continue
          }
          const id = toSha256(JSON.stringify([buildMusicCacheId(musicInfo, quality), directory]))
          let item = list.find((task) => task.id === id) ?? created.find((task) => task.id === id)
          if (item) {
            if (await hasCompletedFile(item)) {
              result.skipped.push({ musicId: musicInfo.id, reason: t('download.completed_skipped') })
              continue
            }
            if (!created.includes(item)) await start(item)
          } else {
            const ext = getFileType(quality)
            const fileName = `${buildDownloadName(buildMusicName(settings['download.fileName'], musicInfo.name, musicInfo.singer))}.${ext}`
            item = {
              id,
              status: 'waiting',
              statusText: '',
              isComplate: false,
              progress: 0,
              downloaded: 0,
              total: 0,
              speed: '',
              writeQueue: 0,
              metadata: {
                musicInfo: structuredClone(musicInfo),
                url: null,
                quality,
                ext,
                fileName,
                filePath: buildFilePath(directory, fileName),
                task: {
                  requestedQuality: quality,
                  settings: settingsSnapshot(),
                },
              },
            }
            created.push(item)
          }
          if (!result.taskIds.includes(id)) result.taskIds.push(id)
        }
        if (created.length) {
          const position = settings['list.addMusicLocationType']
          const snapshots = created.map(copy)
          await serializeWrite(async () => {
            await options.dbService.downloadInfoSave(snapshots, position)
            list = position === 'top' ? [...created, ...list] : [...list, ...created]
            emit({ action: 'add', data: snapshots, position })
          })
        }
        return result
      }).finally(startQueue)
    },
    startDownloadTasks(ids: string[]) {
      return exclusive(async () => {
        if (!options.getSettings()['download.enable']) throw new Error(t('download.disabled'))
        for (const item of selected(ids)) await start(item)
      }).finally(startQueue)
    },
    pauseDownloadTasks(ids: string[]) {
      return exclusive(async () => {
        for (const item of selected(ids)) {
          await stop(item)
          if (item.status === 'completed') continue
          const paused = { ...copy(item), status: 'pause' as const, isComplate: false, statusText: '', speed: '', writeQueue: 0 }
          await save(paused)
          Object.assign(item, paused)
        }
      }).finally(startQueue)
    },
    removeDownloadTasks(ids: string[]) {
      return exclusive(async () => {
        const items = selected(ids)
        for (const item of items) {
          await stop(item)
          await cleanAuxiliary(item, true)
        }
        await serializeWrite(async () => {
          const clear = items.length === list.length
          if (clear) await options.dbService.downloadInfoClear()
          else await options.dbService.downloadInfoRemove(items.map((item) => item.id))
          const removed = new Set(ids)
          list = list.filter((item) => !removed.has(item.id))
          for (const id of ids) refreshUrls.delete(id)
          emit(clear ? { action: 'clear' } : { action: 'remove', data: [...removed] })
        })
      }).finally(startQueue)
    },
    async getDownloadMusicInfos(ids: string[]) {
      await operations
      const paths: string[] = []
      for (const item of selected(ids)) {
        if (!(await hasCompletedFile(item))) throw new Error(t('download.file_missing'))
        paths.push(item.metadata.filePath)
      }
      if (!options.createLocalMusicInfos) throw new Error(t('download.file_missing'))
      return options.createLocalMusicInfos(paths)
    },
  }
}
