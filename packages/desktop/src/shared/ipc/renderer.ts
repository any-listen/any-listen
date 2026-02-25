import { ipcRenderer } from 'electron'
import { createMessage2Call } from 'message2call'

import { createName } from './names'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMainCall = <T>(namespace: string, exposeObj: Record<string, (...args: any[]) => Promise<unknown>>) => {
  let evt: null | Electron.IpcRendererEvent = null
  const channelName = createName(namespace)
  const message2call = createMessage2Call<T>({
    exposeObj,
    sendMessage(data) {
      ipcRenderer.send(channelName, data)
    },
    onCallBeforeParams(rawArgs) {
      return [evt, ...rawArgs]
    },
    isSendErrorStack: true,
    timeout: 0,
  })
  ipcRenderer.on(channelName, (event, data) => {
    evt = event
    message2call.message(data)
  })

  return {
    remote: message2call.remote,
    destroy: message2call.destroy,
  }
}
