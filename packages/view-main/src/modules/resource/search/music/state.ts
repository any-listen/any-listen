export interface ListInfo {
  requestPromise?: Promise<AnyListen.IPCResource.MusicListResult>
  total: number
  page: number
  limit: number
  searchKey: string | null
  requestKey: string | null
  cacheTime: number
}
export interface InitState {
  lists: Map<string, ListInfo>
}

export const musicState: InitState = {
  lists: new Map(),
}
