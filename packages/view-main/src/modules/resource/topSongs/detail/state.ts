export interface ListInfo {
  requestPromise?: Promise<AnyListen.IPCResource.TopSongsDetailResult>
  total: number
  page: number
  limit: number
  searchKey: string | null
  requestKey: string | null
  info: AnyListen.Resource.TopSongsDetailInfo | null
  cacheTime: number
}
export interface InitState {
  lists: Map<string, ListInfo>
}

export const musicState: InitState = {
  lists: new Map(),
}
