export interface InitState {
  lists: Map<
    string,
    {
      requestPromise?: Promise<AnyListen.Resource.TopSongsItem[]>
      cacheTime: number
    }
  >
}

export const topSongsState: InitState = {
  lists: new Map(),
}
