import { songlistTags } from '@/shared/ipc/resource'

import { tagsState } from './state'

const CACHE_TIME = 60 * 60_000 * 6 // 6 hours

const buildSourceKey = (extId: string, source: string) => `${extId}.${source}`

export const resetTags = (extId: string, source: string) => {
  const sourceKey = buildSourceKey(extId, source)
  let listInfo = tagsState.lists.get(sourceKey)
  if (!listInfo) return
  tagsState.lists.delete(sourceKey)
}
export const resetAllTags = () => {
  tagsState.lists.clear()
}

const getCachedListInfo = (extId: string, source: string): Promise<AnyListen.IPCExtension.SonglistTagResult> | null => {
  const listInfo = tagsState.lists.get(buildSourceKey(extId, source))
  if (listInfo && performance.now() - listInfo.cacheTime < CACHE_TIME) {
    return listInfo.requestPromise ?? null
  }
  return null
}
const setCachedListInfo = (extId: string, source: string, promise: Promise<AnyListen.IPCExtension.SonglistTagResult>) => {
  const sourceKey = buildSourceKey(extId, source)

  tagsState.lists.set(sourceKey, {
    requestPromise: promise.catch((error) => {
      tagsState.lists.delete(sourceKey)
      console.log(error)
      throw error
    }),
    cacheTime: performance.now(),
  })
}

export const getData = async (extensionId: string, source: string): Promise<AnyListen.IPCExtension.SonglistTagResult> => {
  console.log(extensionId, source)
  const cacheListInfo = getCachedListInfo(extensionId, source)
  if (cacheListInfo) return cacheListInfo

  const promise = songlistTags({ extensionId, source }).then((result) => {
    console.log(result)
    return result
  })
  setCachedListInfo(extensionId, source, promise)
  return promise
}
