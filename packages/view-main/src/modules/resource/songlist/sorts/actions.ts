import { songlistSorts } from '@/shared/ipc/resource'

import { sortsState } from './state'

const CACHE_TIME = 60 * 60_000 * 6 // 6 hours

const buildSourceKey = (extId: string, source: string) => `${extId}.${source}`

export const resetSorts = (extId: string, source: string) => {
  const sourceKey = buildSourceKey(extId, source)
  let listInfo = sortsState.lists.get(sourceKey)
  if (!listInfo) return
  sortsState.lists.delete(sourceKey)
}
export const resetAllSorts = () => {
  sortsState.lists.clear()
}

const getCachedListInfo = (extId: string, source: string): Promise<AnyListen.Resource.TagItem[]> | null => {
  const listInfo = sortsState.lists.get(buildSourceKey(extId, source))
  if (listInfo && performance.now() - listInfo.cacheTime < CACHE_TIME) {
    return listInfo.requestPromise ?? null
  }
  return null
}
const setCachedListInfo = (extId: string, source: string, promise: Promise<AnyListen.Resource.TagItem[]>) => {
  const sourceKey = buildSourceKey(extId, source)

  sortsState.lists.set(sourceKey, {
    requestPromise: promise.catch((error) => {
      sortsState.lists.delete(sourceKey)
      console.log(error)
      throw error
    }),
    cacheTime: performance.now(),
  })
}

export const getData = async (extensionId: string, source: string): Promise<AnyListen.Resource.TagItem[]> => {
  console.log(extensionId, source)
  const cacheListInfo = getCachedListInfo(extensionId, source)
  if (cacheListInfo) return cacheListInfo

  const promise = songlistSorts({ extensionId, source }).then((result) => {
    console.log(result)
    return result
  })
  setCachedListInfo(extensionId, source, promise)
  return promise
}
