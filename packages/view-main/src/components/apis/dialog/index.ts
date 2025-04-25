import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'
import { i18n } from '@/plugins/i18n'
import App from './App.svelte'

export const showConfirmModal = async (
  message: string,
  buttons: readonly AnyListen.IPCCommon.MessageButton[],
  select = false
) => {
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
  return (app.show('', buttons, '', message, select) as Promise<number>).finally(() => {
    unsub()
  })
}

export const showSimpleConfirmModal = async (
  message: string,
  options: { cancelBtn?: string; confirmBtn?: string; selectText?: boolean } = {}
) => {
  const buttons = [options.cancelBtn ?? i18n.t('btn_cancel'), options.confirmBtn ?? i18n.t('btn_confirm')] as const
  const result = await showConfirmModal(
    message,
    buttons.map((t) => ({ text: t })),
    options.selectText
  ).catch(() => 0)
  return result == 1
}

export const showSimpleModal = async (message: string, options: { confirmBtn?: string; selectText?: boolean } = {}) => {
  const buttons = [options.confirmBtn ?? i18n.t('btn_confirm')] as const
  const result = await showConfirmModal(
    message,
    buttons.map((t) => ({ text: t })),
    options.selectText
  ).catch(() => 0)
  return result == 0
}
