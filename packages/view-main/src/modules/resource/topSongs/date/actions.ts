import { topSongsDate } from '@/shared/ipc/resource'

import { dateState } from './state'

const CACHE_TIME = 60 * 60_000 * 6 // 6 hours

const buildSourceKey = (extId: string, source: string, id: string) => `${extId}.${source}.${id}`

export const resetDate = (extId: string, source: string, id: string) => {
  const sourceKey = buildSourceKey(extId, source, id)
  let listInfo = dateState.lists.get(sourceKey)
  if (!listInfo) return
  dateState.lists.delete(sourceKey)
}
export const resetAllDate = () => {
  dateState.lists.clear()
}

const getCachedListInfo = (extId: string, source: string, id: string): Promise<AnyListen.Resource.TagItem[]> | null => {
  const listInfo = dateState.lists.get(buildSourceKey(extId, source, id))
  if (listInfo && performance.now() - listInfo.cacheTime < CACHE_TIME) {
    return listInfo.requestPromise ?? null
  }
  return null
}
const setCachedListInfo = (extId: string, source: string, id: string, promise: Promise<AnyListen.Resource.TagItem[]>) => {
  const sourceKey = buildSourceKey(extId, source, id)

  dateState.lists.set(sourceKey, {
    requestPromise: promise.catch((error) => {
      dateState.lists.delete(sourceKey)
      console.log(error)
      throw error
    }),
    cacheTime: performance.now(),
  })
}

export const getData = async (extensionId: string, source: string, id: string): Promise<AnyListen.Resource.TagItem[]> => {
  console.log(extensionId, source, id)
  const cacheListInfo = getCachedListInfo(extensionId, source, id)
  if (cacheListInfo) return cacheListInfo

  const promise = topSongsDate({ extensionId, source, id }).then((result) => {
    console.log(result)
    return result
  })
  setCachedListInfo(extensionId, source, id, promise)
  return promise
}
