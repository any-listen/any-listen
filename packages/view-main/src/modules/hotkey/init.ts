import { onBlur, onConnected, onFocus, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { clearDownKeys, registerKeyEvent } from './keyboard'
import { getHotKey, registerRemoteActions, initConfig } from './store/actions'

const init = async () => {
  initConfig(await getHotKey())
}

const unregistered = createUnsubscriptionSet()
export const initHotkey = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerKeyEvent())
      subscriptions.add(onFocus(clearDownKeys))
      subscriptions.add(onBlur(clearDownKeys))
      subscriptions.add(registerRemoteActions())
    })

    void init()
  })
}
