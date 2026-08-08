import { deduplicationList } from '@any-listen/common/tools'

import { topSongsDetail } from '@/shared/ipc/resource'

import { musicState } from './state'

const CACHE_TIME = 60 * 60_000 * 6 // 6 hours

const buildSourceKey = (extId: string, source: string) => `${extId}.${source}`
const buildSearchKey = (extId: string, source: string, limit: number, id: string, date: string) => {
  return `${extId}.${source}.${limit}.${id}.${date}`
}
export const buildRequestKey = (extId: string, source: string, page: number, limit: number, id: string, date: string) => {
  return `${extId}.${source}.${page}.${limit}.${id}.${date}`
}

export const resetListInfo = (extId: string, source: string) => {
  let listInfo = musicState.lists.get(buildSourceKey(extId, source))
  if (!listInfo) return
  listInfo.requestPromise = undefined
  listInfo.page = 0
  listInfo.total = 0
  listInfo.searchKey = null
  listInfo.requestKey = null
  listInfo.info = null
  listInfo.cacheTime = 0
}
export const resetAllListInfo = () => {
  musicState.lists.forEach((listInfo) => {
    listInfo.requestPromise = undefined
    listInfo.page = 0
    listInfo.total = 0
    listInfo.searchKey = null
    listInfo.requestKey = null
    listInfo.info = null
    listInfo.cacheTime = 0
  })
}

const getCachedListInfo = (
  extId: string,
  source: string,
  page: number,
  limit: number,
  id: string,
  date: string
): [Promise<AnyListen.IPCResource.TopSongsDetailResult> | null, number, AnyListen.Resource.TopSongsDetailInfo | null] | null => {
  const listInfo = musicState.lists.get(buildSourceKey(extId, source))
  if (listInfo && performance.now() - listInfo.cacheTime < CACHE_TIME) {
    if (listInfo.requestKey == buildRequestKey(extId, source, page, limit, id, date)) {
      return [listInfo.requestPromise!, listInfo.total, listInfo.info]
    }
    if (listInfo.searchKey == buildSearchKey(extId, source, limit, id, date)) {
      return [null, listInfo.total, listInfo.info]
    }
  }
  return null
}
const setCachedListInfo = (
  extId: string,
  source: string,
  page: number,
  limit: number,
  id: string,
  date: string,
  promise: Promise<AnyListen.IPCResource.TopSongsDetailResult>
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  const sourceKey = buildSourceKey(extId, source)
  const searchKey = buildSearchKey(extId, source, limit, id, date)
  const requestKey = buildRequestKey(extId, source, page, limit, id, date)
  let listInfo = musicState.lists.get(sourceKey)
  if (!listInfo) {
    listInfo = {
      page: 0,
      total: 0,
      limit,
      searchKey: null,
      requestKey: null,
      requestPromise: undefined,
      info: null,
      cacheTime: performance.now(),
    }
    musicState.lists.set(sourceKey, listInfo)
  }
  listInfo.searchKey = searchKey
  listInfo.requestKey = requestKey
  listInfo.requestPromise = promise
    .then((result) => {
      const listInfo = musicState.lists.get(sourceKey)
      if (listInfo?.requestKey === requestKey) {
        listInfo.page = page
        listInfo.limit = limit
        listInfo.total = result.total
        listInfo.info = result.info
        listInfo.cacheTime = performance.now()
      }
      return result
    })
    .catch((error) => {
      const listInfo = musicState.lists.get(sourceKey)
      if (listInfo?.requestKey === requestKey) {
        listInfo.requestPromise = undefined
        listInfo.page = 0
        listInfo.total = 0
        listInfo.cacheTime = 0
      }
      console.log(error)
      throw error
    })
}

export const detail = (
  extensionId: string,
  source: string,
  id: string,
  date: string,
  page: number,
  limit: number
): {
  promise: Promise<AnyListen.IPCResource.TopSongsDetailResult>
  total: number
  info: AnyListen.Resource.TopSongsDetailInfo | null
} => {
  console.log(extensionId, source, id, date, page, limit)
  if (!id.trim().length) {
    return {
      promise: Promise.resolve({
        list: [],
        total: 0,
        limit,
        page,
        info: {
          name: '',
        },
      }),
      total: 0,
      info: null,
    }
  }
  const cacheListInfo = getCachedListInfo(extensionId, source, page, limit, id, date)
  if (cacheListInfo?.[0]) {
    return {
      promise: cacheListInfo[0],
      total: cacheListInfo[1],
      info: cacheListInfo[2],
    }
  }
  const promise = topSongsDetail({
    extensionId,
    source,
    id,
    date,
    limit,
    page,
  }).then((result) => {
    console.log(result)
    return result
  })
  setCachedListInfo(extensionId, source, page, limit, id, date, promise)
  return {
    promise,
    total: cacheListInfo?.[1] ?? 0,
    info: cacheListInfo?.[2] ?? null,
  }
}

export const topSongsDetailAll = async (
  extensionId: string,
  source: string,
  id: string,
  date: string
): Promise<AnyListen.Music.MusicInfoOnline[]> => {
  let limit = 10000
  const loadData = async (page: number): Promise<AnyListen.IPCResource.TopSongsDetailResult> => {
    return topSongsDetail({
      extensionId,
      source,
      id,
      date,
      limit,
      page,
    }).then((result) => {
      console.log(result)
      return result
    })
  }

  return loadData(1)
    .then(async (result) => {
      if (result.total <= result.limit) return result.list
      limit = result.limit

      const list = [...result.list]
      const maxPage = Math.ceil(result.total / limit)
      let page = 1
      while (++page <= maxPage) {
        const res = await loadData(page)
        list.push(...res.list)
      }
      return list
    })
    .then((list) => deduplicationList(list))
}
