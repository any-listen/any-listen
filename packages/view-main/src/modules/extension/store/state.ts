export interface InitState {
  extensionList: AnyListen.Extension.Extension[]
  onlineExtensionList: AnyListen.IPCExtension.OnlineListItem[]
  status: 'LOADING' | 'STARTING' | 'IDLE'
  crashMessage: string | null
  resourceList: AnyListen.Extension.ResourceList
  newVersionInfo: AnyListen.IPCExtension.EventVersionInfoUpdated
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
  newVersionInfo: {},
}
