import { songlist } from '@/shared/ipc/resource'

import { musicState } from './state'

const CACHE_TIME = 60 * 60_000 * 6 // 6 hours

const buildSourceKey = (extId: string, source: string) => `${extId}.${source}`
const buildSearchKey = (extId: string, source: string, limit: number, tag: string, sort: string) => {
  return `${extId}.${source}.${limit}.${tag}-${sort}`
}
export const buildRequestKey = (extId: string, source: string, page: number, limit: number, tag: string, sort: string) => {
  return `${extId}.${source}.${page}.${limit}.${tag}-${sort}`
}

export const resetListInfo = (extId: string, source: string) => {
  let listInfo = musicState.lists.get(buildSourceKey(extId, source))
  if (!listInfo) return
  listInfo.requestPromise = undefined
  listInfo.page = 0
  listInfo.total = 0
  listInfo.searchKey = null
  listInfo.requestKey = null
  listInfo.cacheTime = 0
}
export const resetAllListInfo = () => {
  musicState.lists.forEach((listInfo) => {
    listInfo.requestPromise = undefined
    listInfo.page = 0
    listInfo.total = 0
    listInfo.searchKey = null
    listInfo.requestKey = null
    listInfo.cacheTime = 0
  })
}

const getCachedListInfo = (
  extId: string,
  source: string,
  page: number,
  limit: number,
  tag: string,
  sort: string
): [Promise<AnyListen.IPCResource.SonglistListResult> | null, number] | null => {
  const listInfo = musicState.lists.get(buildSourceKey(extId, source))
  if (listInfo && performance.now() - listInfo.cacheTime < CACHE_TIME) {
    if (listInfo.requestKey == buildRequestKey(extId, source, page, limit, tag, sort)) {
      return [listInfo.requestPromise!, listInfo.total]
    }
    if (listInfo.searchKey == buildSearchKey(extId, source, limit, tag, sort)) {
      return [null, listInfo.total]
    }
  }
  return null
}
const setCachedListInfo = (
  extId: string,
  source: string,
  page: number,
  limit: number,
  tag: string,
  sort: string,
  promise: Promise<AnyListen.IPCResource.SonglistListResult>
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  const sourceKey = buildSourceKey(extId, source)
  const searchKey = buildSearchKey(extId, source, limit, tag, sort)
  const requestKey = buildRequestKey(extId, source, page, limit, tag, sort)
  let listInfo = musicState.lists.get(sourceKey)
  if (!listInfo) {
    listInfo = {
      page: 0,
      total: 0,
      limit,
      searchKey: null,
      requestKey: null,
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

export const getData = (
  extensionId: string,
  source: string,
  tag: string,
  sort: string,
  page: number,
  limit: number
): {
  promise: Promise<AnyListen.IPCResource.SonglistListResult>
  total: number
} => {
  console.log(extensionId, source, tag, sort, page, limit)
  const cacheListInfo = getCachedListInfo(extensionId, source, page, limit, tag, sort)
  if (cacheListInfo?.[0]) {
    return {
      promise: cacheListInfo[0],
      total: cacheListInfo[1],
    }
  }
  const promise = songlist({
    extensionId,
    source,
    tag,
    sort,
    limit,
    page,
  }).then((result) => {
    console.log(result)
    return result
  })
  setCachedListInfo(extensionId, source, page, limit, tag, sort, promise)
  return {
    promise,
    total: cacheListInfo?.[1] ?? 0,
  }
}
