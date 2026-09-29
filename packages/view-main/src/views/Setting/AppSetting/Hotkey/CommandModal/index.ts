import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'

import App from './App.svelte'

export const showHotkeyCommandModal = async (selectedCommand: string): Promise<string | null> => {
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
  return (app.show(selectedCommand) as Promise<string | null>).finally(() => {
    unsub()
  })
}
