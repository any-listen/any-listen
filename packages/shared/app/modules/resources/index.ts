import type { ExtensionSeriveTypes } from '../worker/utils'
import { initService } from './shared'

export const initResources = (_extensionSerive: ExtensionSeriveTypes) => {
  void initService(_extensionSerive)
}
