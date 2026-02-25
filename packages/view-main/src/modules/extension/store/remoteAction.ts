import { dateFormat } from '@/shared'
import { extensionEvent as extensionEventRemote } from '@/shared/ipc/extension/event'

import { extI18n } from '../i18n'
import * as commit from './commit'
import { extensionEvent } from './event'

export {
  disableExtension,
  downloadAndParseExtension,
  enableExtension,
  getAllExtensionSettings,
  getExtensionErrorMessage,
  getExtensionList,
  getOnlineExtensionList,
  getResourceList,
  installExtension,
  listProviderAction,
  resetOnlineData,
  resourceAction,
  restartExtension,
  restartExtensionHost,
  startExtension,
  uninstallExtension,
  updateExtension,
  updateExtensionSettings,
} from '@/shared/ipc/extension'

export const registerRemoteExtensionEvent = () => {
  const loadExt = (id: string) => {
    // commit.setExtensionState(id, )
  }
  const stopExt = (id: string) => {
    // commit.setExtensionRuning(id, loadTimestamp)
  }
  return extensionEventRemote.on((action): void => {
    console.log('onExtensionEvent', action)
    switch (action.action) {
      case 'listSet':
        commit.setList(action.data)
        break
      case 'listAdd':
        commit.addExtension(action.data)
        break
      case 'listUpdate':
        commit.updateExtension(action.data)
        break
      case 'listRemove':
        commit.removeExtension(action.data)
        break
      case 'loadListStart':
        commit.setStatus('LOADING')
        break
      case 'loadListEnd':
        commit.setStatus('IDLE')
        break
      case 'starting':
        commit.setStatus('STARTING')
        break
      case 'started':
        commit.setStatus('IDLE')
        break
      case 'loading':
        loadExt(action.data)
        break
      case 'loaded':
        commit.setExtensionRuning(action.data.id, action.data.loadTimestamp)
        break
      case 'enabled':
        commit.setExtensionEnabled(action.data.id, action.data.enabled)
        break
      case 'stoping':
        stopExt(action.data)
        break
      case 'stopped':
        commit.setExtensionStopped(action.data)
        break
      case 'loadError':
        commit.setExtensionError(action.data.id, action.data.message)
        break
      case 'crash':
        commit.setCrash(action.data)
        break
      case 'error':
        console.error('[ExtensionHost]', action.data)
        break
      case 'logOutput':
        console[action.data.type == 'info' ? 'log' : action.data.type](
          '[ExtensionHost]',
          `[${dateFormat(action.data.timestamp)} ${action.data.id}(${extI18n.t(action.data.id, action.data.name)})]`,
          action.data.message
        )
        extensionEvent.logOutput(action.data)
        break
      case 'resourceUpdated':
        commit.setResourceList(action.data)
        break
      case 'extenstionSettingUpdated':
        // commit.setResourceList(action.data)
        // console.log('[ExtensionHost]', action.data)
        extensionEvent.extenstionSettingUpdated(action.data)
        break
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default:
        console.warn('unknown action:', action)
        // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
        let unknownAction: never = action
    }
  })
}
