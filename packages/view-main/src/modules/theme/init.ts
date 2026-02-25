import { onConnected, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { applyTheme, getThemeSetting, registerRemoteThemeAction } from './store/action'
import { updateTheme } from './store/commit'

const init = async () => {
  const theme = await getThemeSetting()
  applyTheme(theme.colors)
  updateTheme(theme)
}

const unregistered = createUnsubscriptionSet()
export const initTheme = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerRemoteThemeAction())
    })

    void init()
  })
}
