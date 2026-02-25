import { mount, type ComponentExports } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'
import { closeMessageBoxEvent } from '@/shared/ipc/app/event'

import App from './App.svelte'

let app: ComponentExports<typeof App>
export const initNotify = () => {
  app = mount(App, {
    target: document.getElementById('root')!,
  })
  onDesconnected(() => {
    app.hide()
  })
}

export const showNotify = (message?: string, duration = 3, textSelect?: boolean) => {
  if (!message) return
  if (message.length > 1000) {
    message = `${message.substring(0, 1000)}...`
  }
  app.show(message, duration, textSelect)
}

export const showNotifyBox = async (extId: string, key: string, options: AnyListen.IPCCommon.MessageDialogOptions) => {
  if (!options.detail) return 0
  const release = () => {
    app.hide(id)
    unsub()
    unsub2()
  }
  const unsub = onDesconnected(() => {
    onError(new Error('desconnected'))
    release()
  })
  const unsub2 = closeMessageBoxEvent.on((_key) => {
    if (key != _key) return
    release()
  })
  const id = app.show(options.detail, 3, options.textSelect, extId, () => {
    onHide(0)
  })
  let onHide: (value: number) => void
  let onError: (err: Error) => void
  return new Promise<number>((resolve, reject) => {
    onHide = resolve
    onError = reject
  })
}
