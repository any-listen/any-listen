import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'

import type { HotkeyBinding } from '../shared'
import App from './App.svelte'

export const showHotkeyEditModal = async (payload?: HotkeyBinding): Promise<HotkeyBinding | null> => {
  const app = mount(App, {
    target: document.getElementById('root')!,
    props: {
      onafterleave() {
        void unmount(app, { outro: true })
      },
    },
  })
  const unsub = onDesconnected(() => {
    app.hide()
    unsub()
  })
  await tick()
  return (app.show(payload) as Promise<HotkeyBinding | null>).finally(() => {
    unsub()
  })
}
