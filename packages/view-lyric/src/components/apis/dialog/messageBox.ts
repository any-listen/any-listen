import { mount, tick, unmount } from 'svelte'

import { onWinMainIPCDisconnected } from '@/modules/app/shared'
import { i18n } from '@/plugins/i18n'

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
  }
  const unsub = onWinMainIPCDisconnected(release)
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
  })
}
