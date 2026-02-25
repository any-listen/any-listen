import { onRelease } from '@/modules/app/shared'
import { settingEvent } from '@/modules/setting/store/event'
import { languageChangeEvent } from '@/plugins/i18n'
import { createUnsubscriptionSet } from '@/shared'

import { setMessages } from './i18n'
import {
  getExtensionErrorMessage,
  getExtensionList,
  getOnlineExtensionList,
  getResourceList,
  registerRemoteExtensionEvent,
  setCrash,
  setList,
  setResourceList,
} from './store/actions'
import { setOnlineExtension } from './store/commit'
import { extensionEvent } from './store/event'
import { extensionState } from './store/state'

const init = async () => {
  const message = await getExtensionErrorMessage()
  setCrash(message)
  if (message == null) {
    await Promise.all([
      getExtensionList().then((list) => {
        console.log(list)
        setList(list)
        setMessages(list)
      }),
      getResourceList().then((list) => {
        console.log(list)
        setResourceList(list)
      }),
    ])
  } else console.error('[ExtensionHost]', message)
}

let unregistereds = createUnsubscriptionSet()
export const initExtension = () => {
  onRelease(unregistereds.clear.bind(unregistereds))
  settingEvent.on('inited', () => {
    unregistereds.register((subscriptions) => {
      subscriptions.add(registerRemoteExtensionEvent())
      subscriptions.add(
        extensionEvent.on('listChanged', (isChanged) => {
          if (extensionState.onlineExtensionList.length) setOnlineExtension(extensionState.onlineExtensionList)

          if (isChanged) setMessages(extensionState.extensionList)
        })
      )
      subscriptions.add(
        languageChangeEvent.on(() => {
          if (extensionState.onlineExtensionList.length) {
            void getOnlineExtensionList(true)
          }
        })
      )
    })
    void init()
  })
}
