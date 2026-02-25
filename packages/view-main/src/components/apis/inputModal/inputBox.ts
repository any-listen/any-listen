import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'
import { closeMessageBoxEvent } from '@/shared/ipc/app/event'

import App from './App.svelte'

export const showInputBox = async (
  extId: string,
  key: string,
  options: AnyListen.IPCCommon.InputDialogOptions
): Promise<string> => {
  const app = mount(App, {
    target: document.getElementById('root')!,
    props: {
      onafterleave() {
        void unmount(app, { outro: true })
      },
    },
  })
  const release = () => {
    app.hide()
    unsub()
    unsub2()
  }
  const unsub = onDesconnected(release)
  const unsub2 = closeMessageBoxEvent.on((_key) => {
    if (key != _key) return
    release()
  })
  await tick()
  return (app.show(extId, options) as Promise<string>).finally(() => {
    key = ''
    unsub()
    unsub2()
  })
}
