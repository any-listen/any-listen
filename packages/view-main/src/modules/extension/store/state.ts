export type OnlineListItem = AnyListen.IPCExtension.OnlineListItem & {
  installed: boolean
  enabled: boolean
  latest: boolean
  currentVersion: string
}

export interface InitState {
  extensionList: AnyListen.Extension.Extension[]
  onlineExtensionList: OnlineListItem[]
  status: 'LOADING' | 'STARTING' | 'IDLE'
  crashMessage: string | null
  resourceList: AnyListen.Extension.ResourceList
}

export const extensionState: InitState = {
  extensionList: [],
  onlineExtensionList: [],
  status: 'IDLE',
  crashMessage: null,
  resourceList: {
    resources: {},
    listProvider: [],
    commands: [],
  },
}
