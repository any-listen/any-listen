export const extensionState: {
  extensionDir: string
  crashMessage: string | null
  // extensionList: AnyListen.Extension.Extension[]
  resources: AnyListen.Extension.ResourceList
} = {
  extensionDir: '',
  crashMessage: null,
  // extensionList: [],
  resources: {
    resources: {},
    listProvider: [],
  },
}
