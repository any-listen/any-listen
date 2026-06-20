import { settingEvent } from '@/modules/setting/store/event'

import { createUnsubscriptionSet } from '..'
import { themeChangedEvent } from '../ipc/theme/event'
import { desktopLyricDestroyedEvent, desktopLyricInitedEvent } from './event'
import { initIpcLyric } from './ipc'

export const initIpcDesktopLyric = () => {
  initIpcLyric()

  const unregistered = createUnsubscriptionSet()
  desktopLyricInitedEvent.on((ipc) => {
    unregistered.clear()
    unregistered.add(
      settingEvent.on('updated', (keys, settings) => {
        try {
          void ipc.settingChanged(keys, settings)
        } catch {}
      })
    )
    unregistered.add(
      themeChangedEvent.on((theme) => {
        try {
          void ipc.themeChanged(theme)
        } catch {}
      })
    )
  })
  desktopLyricDestroyedEvent.on(() => {
    unregistered.clear()
  })
}
