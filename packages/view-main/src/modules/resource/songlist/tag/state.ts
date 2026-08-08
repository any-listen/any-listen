export interface InitState {
  lists: Map<
    string,
    {
      requestPromise?: Promise<AnyListen.IPCExtension.SonglistTagResult>
      cacheTime: number
    }
  >
}

export const tagsState: InitState = {
  lists: new Map(),
}
