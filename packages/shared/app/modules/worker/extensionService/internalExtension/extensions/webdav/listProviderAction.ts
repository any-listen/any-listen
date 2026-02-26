import { createCache } from '@any-listen/common/cache'
import { sizeFormate, debounce } from '@any-listen/common/utils'
import { isMusicFile } from '@any-listen/nodejs/music'

import { hostContext, logcat } from './shared'
import { debugLog, getWebDAVOptionsByListInfo, getWebDAVOptionsByMusicInfo } from './utils'
import {
  buildWebDAVError,
  createWebDAVClient,
  parseMusicMetadata,
  testDir,
  type WebDAVClient,
  type WebDAVClientOptions,
  type WebDAVFileItem,
  type WebDAVItem,
} from './webdav'

const listCache = createCache<WebDAVItem[]>({ ttl: 10 * 60 * 1000 })
const MUSIC_CACHE_TTL = 2 * 60 * 1000
const musicCache = {
  cache: new Map<string, [number, WebDAVFileItem]>(),
  ttl: MUSIC_CACHE_TTL,
  runClean() {
    const now = performance.now()
    for (const [key, [time]] of this.cache) {
      if (now - time < this.ttl) continue
      this.cache.delete(key)
    }
  },
  runCleanThrottled: debounce(() => {
    musicCache.runClean()
  }, MUSIC_CACHE_TTL + 1000),
  set(key: string, value: WebDAVFileItem) {
    this.cache.set(key, [performance.now(), value])
    this.runCleanThrottled()
  },
  get(key: string) {
    return this.cache.get(key)?.[1]
  },
  has(key: string) {
    return this.cache.has(key)
  },
}

const MAX_DEEP = 5

const generateId = (extId: string, source: string, options: WebDAVClientOptions, item: WebDAVItem) => {
  return `${extId}_${source}_${options.username}_${options.url}_${item.path}`
}

interface WebDAVItemWithId extends WebDAVFileItem {
  id: string
}

const getDirFiles = async (
  opts: {
    webDAVClient: WebDAVClient
    webDAVClientOptions: WebDAVClientOptions
    extId: string
    source: string
    path: string
    isIncludeDir: boolean
    useCache?: boolean
  },
  deep = 0
): Promise<WebDAVItemWithId[]> => {
  void debugLog(`getDirFiles: [${opts.path}] deep: ${deep}`)

  const buildMusicIds = async (list: WebDAVItem[]) => {
    const dirs: string[] = []
    let items: WebDAVItemWithId[] = []
    for (const item of list) {
      if (item.isDir) {
        if (opts.isIncludeDir && deep < MAX_DEEP) dirs.push(item.path)
      } else if (item.size > 0 && isMusicFile(item.name)) {
        const path = generateId(opts.extId, opts.source, opts.webDAVClientOptions, item)
        musicCache.set(path, item)
        items.push({ ...item, id: path })
      }
    }
    if (dirs.length) {
      for (const dir of dirs) {
        const subItems = await getDirFiles({ ...opts, path: dir }, deep + 1)
        items = items.concat(subItems)
      }
    }
    return items
  }

  const list =
    opts.useCache && listCache.has(opts.path)
      ? listCache.get(opts.path)!
      : await opts.webDAVClient
          .ls(opts.path)
          .then((list) => {
            listCache.set(opts.path, list)
            return list
          })
          .catch((err: Error) => {
            logcat.error('WebDAV list error', err)
            throw buildWebDAVError(opts.webDAVClientOptions, err)
          })

  return buildMusicIds(list)
}
const getListMusicIds = async (
  webDAVClientOptions: WebDAVClientOptions,
  extId: string,
  source: string,
  path: string,
  isIncludeDir: boolean,
  useCache = false
) => {
  const webDAVClient = createWebDAVClient(webDAVClientOptions)
  const items = await getDirFiles({ webDAVClient, webDAVClientOptions, extId, source, path, isIncludeDir, useCache })
  return items.map((item) => item.id)
}
const sortMusics = (musics: AnyListen.Music.MusicInfoOnline[], files: WebDAVItemWithId[], type: AnyListen.List.SortFileType) => {
  const idMap = new Set<string>()
  for (const music of musics) idMap.add(music.id)
  let sortedFiles = [...files]
  const ids: string[] = []
  switch (type) {
    case 'ctime_asc':
      sortedFiles.sort((a, b) => {
        return a.creationDate - b.creationDate
      })
      break
    case 'ctime_desc':
      sortedFiles.sort((a, b) => {
        return b.creationDate - a.creationDate
      })
      break
    case 'mtime_asc':
      sortedFiles.sort((a, b) => {
        return a.lastModified - b.lastModified
      })
      break
    case 'mtime_desc':
      sortedFiles.sort((a, b) => {
        return b.lastModified - a.lastModified
      })
      break
    case 'size_asc':
      sortedFiles.sort((a, b) => {
        return a.size - b.size
      })
      break
    case 'size_desc':
      sortedFiles.sort((a, b) => {
        return b.size - a.size
      })
      break
  }
  for (const { id } of sortedFiles) {
    if (idMap.has(id)) ids.push(id)
  }

  return ids
}
export const listProviderActions: AnyListen.IPCExtension.ListProviderAction = {
  async createList(params) {
    void debugLog(`createList: ${JSON.stringify(params)}`)
    await testDir(await getWebDAVOptionsByListInfo(params.data.meta))
  },
  async deleteList(params) {
    void debugLog(`deleteList: ${JSON.stringify(params)}`)
  },
  async updateList(params) {
    void debugLog(`updateList: ${JSON.stringify(params)}`)
    await testDir(await getWebDAVOptionsByListInfo(params.data.meta))
  },
  async sortListMusics({ data }) {
    void debugLog('sortListMusics')
    const webDAVClientOptions = await getWebDAVOptionsByListInfo(data.list.meta)
    const webDAVClient = createWebDAVClient(webDAVClientOptions)
    const items = await getDirFiles({
      webDAVClient,
      webDAVClientOptions,
      extId: data.list.meta.extensionId,
      source: data.list.meta.source,
      path: webDAVClientOptions.path,
      isIncludeDir: (data.list.meta.includeSubDir as boolean | undefined) || false,
      useCache: false,
    })
    return sortMusics(data.musics, items, data.type)
  },
  async removeListMusics(params) {
    void debugLog(`removeListMusics: ${JSON.stringify(params)}`)
    if (params.data.musics.length > 1) {
      const confirm = await hostContext.showMessage(
        hostContext.i18n.t('exts.webdav.list_provider.local_list_remove_music_files_confirm', {
          name: params.data.list.name,
          count: params.data.musics.length,
        }),
        {
          type: 'warning',
          modal: true,
          title: hostContext.i18n.t('exts.webdav.list_provider.local_list_remove_music_files_confirm_title'),
          buttons: [{ text: hostContext.i18n.t('cancel_button_text_2') }, { text: hostContext.i18n.t('confirm_button_text') }],
        }
      )
      if (confirm != 1) throw new Error(hostContext.i18n.t('exts.webdav.list_provider.local_list_remove_music_files_cancelled'))
    }
    const options = await getWebDAVOptionsByListInfo(params.data.list.meta)
    const webDAVClient = createWebDAVClient(options)
    for (const musicInfo of params.data.musics) {
      if (!musicInfo.meta.path || typeof musicInfo.meta.path !== 'string') continue
      await webDAVClient.rm(musicInfo.meta.path).catch((err: Error) => {
        logcat.error('WebDAV remove file error', err)
        throw buildWebDAVError(options, err)
      })
    }
  },
  async getListMusicIds({ extensionId, data }) {
    const options = await getWebDAVOptionsByListInfo(data.meta)
    const list = await getListMusicIds(
      options,
      data.meta.extensionId,
      data.meta.source,
      options.path,
      (data.meta.includeSubDir as boolean | undefined) || false,
      false
    )
    return list
    // const webDAVClient = createWebDAVClient(options)
    // const list = await webDAVClient.ls(options.path).catch((err: Error) => {
    //   logcat.error('WebDAV list error', err)
    //   throw buildWebDAVError(options, err)
    // })
    // const map = new Map<string, WebDAVFileItem>()
    // listCache.set(data.id, map)
    // const extId = data.meta.extensionId
    // const source = data.meta.source
    // return (list.filter((item) => !item.isDir && item.size > 0 && isMusicFile(item.name)) as WebDAVFileItem[]).map((item) => {
    //   const path = generateId(extId, source, options, item)
    //   map.set(path, item)
    //   return path
    // })
  },
  async getMusicInfoByIds({ data }) {
    void debugLog(`getMusicInfoByIds: ${JSON.stringify(data)}`)
    const options = await getWebDAVOptionsByListInfo(data.list.meta)
    await getListMusicIds(
      options,
      data.list.meta.extensionId,
      data.list.meta.source,
      options.path,
      (data.list.meta.includeSubDir as boolean | undefined) || false,
      true
    )
    // let listMap = listCache.get(data.list.id)
    // if (!listMap) {
    //   const webDAVClient = createWebDAVClient(options)
    //   const list = await webDAVClient.ls(options.path)
    //   const extId = data.list.meta.extensionId
    //   const source = data.list.meta.source
    //   listCache.set(
    //     data.list.id,
    //     new Map(
    //       (list.filter((item) => !item.isDir && item.size > 0 && isMusicFile(item.name)) as WebDAVFileItem[]).map((item) => [
    //         generateId(extId, source, options, item),
    //         item,
    //       ])
    //     )
    //   )
    // }
    return {
      musics: data.ids
        .map((id) => {
          const item = musicCache.get(id)
          if (!item) return null
          return {
            id,
            name: item.name.substring(0, item.name.lastIndexOf('.')) || item.name,
            singer: '',
            isLocal: false,
            interval: null,
            meta: {
              unparsed: true,
              createTime: 0,
              musicId: id,
              albumName: '',
              posTime: 0,
              source: 'webdav',
              fileName: item.name,
              size: item.size,
              sizeStr: sizeFormate(item.size),
              updateTime: 0,
              url: options.url,
              username: options.username,
              path: item.path,
            },
          } satisfies AnyListen.Music.MusicInfoOnline
        })
        .filter((m) => m != null),
      waitingParseMetadata: true,
    }
  },
  async parseMusicInfoMetadata({ data: musicInfo }) {
    const url = musicInfo.meta.url
    if (!url || typeof url !== 'string' || !musicInfo.meta.path || typeof musicInfo.meta.path !== 'string') return musicInfo
    const options = await getWebDAVOptionsByMusicInfo(musicInfo)
    const meta = await parseMusicMetadata(options, options.path, (musicInfo.meta.size as number) || 0)
    if (!meta) return { ...musicInfo, meta: { ...musicInfo.meta, unparsed: false } }
    return {
      ...musicInfo,
      name: meta.name || musicInfo.name,
      singer: meta.singer || musicInfo.singer,
      interval: meta.interval || musicInfo.interval,
      meta: {
        ...musicInfo.meta,
        unparsed: false,
        albumName: meta.albumName || musicInfo.meta.albumName || '',
        year: meta.year || musicInfo.meta.year || 0,
        bitrateLabel: meta.bitrateLabel || musicInfo.meta.bitrateLabel || '',
      },
    }
  },
}
