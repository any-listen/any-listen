import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'
import { i18n } from '@/plugins/i18n'
import { closeMessageBoxEvent } from '@/shared/ipc/app/event'

import App from './App.svelte'

const buildDefaultButtons = () => {
  const buttons = [i18n.t('btn_ok')] as const
  return buttons.map((text) => ({ text }))
}

export const showMessageBox = async (
  extId: string,
  key: string,
  options: AnyListen.IPCCommon.MessageDialogOptions
): Promise<number> => {
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
  return (
    app.show(
      extId,
      options.buttons ?? buildDefaultButtons(),
      options.title,
      options.detail,
      options.textSelect
    ) as Promise<number>
  ).finally(() => {
    key = ''
    unsub()
    unsub2()
  })
}
