export interface InitState {
  lists: Map<
    string,
    {
      requestPromise?: Promise<AnyListen.Resource.TagItem[]>
      cacheTime: number
    }
  >
}

export const sortsState: InitState = {
  lists: new Map(),
}
