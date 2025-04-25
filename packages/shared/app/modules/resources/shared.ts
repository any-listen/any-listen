import { extensionEvent } from '../extension'
import type { ExtensionSeriveTypes } from '../worker/utils'

let extensionSerive: ExtensionSeriveTypes

export const initService = async (_extensionSerive: ExtensionSeriveTypes) => {
  extensionSerive = _extensionSerive
  resourceState.resources = await extensionSerive.getResourceList()
  extensionEvent.on('extensionEvent', (event) => {
    if (event.action != 'resourceUpdated') return
    resourceState.resources = event.data
  })
}

export const services = {
  get extensionSerive() {
    return extensionSerive
  },
}

export const resourceState: {
  resources: Partial<
    Record<
      AnyListen.Extension.ResourceAction,
      Array<{
        id: string
        name: string
        extensionId: string
      }>
    >
  >
} = {
  resources: {},
}
