export interface InitState {
  lists: Map<
    string,
    {
      requestPromise?: Promise<AnyListen.Resource.TagItem[]>
      cacheTime: number
    }
  >
}

export const dateState: InitState = {
  lists: new Map(),
}
