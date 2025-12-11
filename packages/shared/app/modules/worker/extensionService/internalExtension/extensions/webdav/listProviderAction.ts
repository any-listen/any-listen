import { createCache } from '@any-listen/common/cache'
import { sizeFormate } from '@any-listen/common/utils'
import { isMusicFile } from '@any-listen/nodejs/music'
import { logcat } from './shared'
import { getWebDAVOptionsByListInfo, getWebDAVOptionsByMusicInfo } from './utils'
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

const listCache = createCache<WebDAVItem[]>()
const musicCache = createCache<WebDAVFileItem>()
const MAX_DEEP = 5

const generateId = (extId: string, source: string, options: WebDAVClientOptions, item: WebDAVItem) => {
  return `${extId}_${source}_${options.username}_${options.url}_${item.path}`
}

const getDirFileIds = async (
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
) => {
  const buildMusicIds = async (list: WebDAVItem[]) => {
    const dirs: string[] = []
    let ids: string[] = []
    for (const item of list) {
      if (item.isDir) {
        if (opts.isIncludeDir && deep < MAX_DEEP) dirs.push(item.path)
      } else if (item.size > 0 && isMusicFile(item.name)) {
        const path = generateId(opts.extId, opts.source, opts.webDAVClientOptions, item)
        musicCache.set(path, item)
        ids.push(path)
      }
    }
    if (dirs.length) {
      for (const dir of dirs) {
        const subIds = await getDirFileIds({ ...opts, path: dir }, deep + 1)
        ids = ids.concat(subIds)
      }
    }
    return ids
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
  return getDirFileIds({ webDAVClient, webDAVClientOptions, extId, source, path, isIncludeDir, useCache })
}
export const listProviderActions: AnyListen.IPCExtension.ListProviderAction = {
  async createList(params) {
    logcat.info(`ListProviderAction createList`, params)
    await testDir(await getWebDAVOptionsByListInfo(params.data.meta))
  },
  async deleteList(params) {
    logcat.info(`ListProviderAction deleteList`, params)
  },
  async updateList(params) {
    logcat.info(`ListProviderAction updateList`, params)
    await testDir(await getWebDAVOptionsByListInfo(params.data.meta))
  },
  async removeListMusics(params) {
    logcat.info(`ListProviderAction removeListMusics`, params)
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
    if (!meta) throw new Error('No metadata found')
    return {
      ...musicInfo,
      name: meta.name || musicInfo.name,
      singer: meta.singer || musicInfo.singer,
      interval: meta.interval || musicInfo.interval,
      meta: {
        ...musicInfo.meta,
        albumName: meta.albumName || musicInfo.meta.albumName || '',
        year: meta.year || musicInfo.meta.year || 0,
        bitrateLabel: meta.bitrateLabel || musicInfo.meta.bitrateLabel || '',
      },
    }
  },
}
