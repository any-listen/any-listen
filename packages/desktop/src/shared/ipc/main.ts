import { ipcMain } from 'electron'
import { createMessage2Call } from 'message2call'

import { createName } from './names'

export const createRendererCall = <T>(
  namespace: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exposeObj: Record<string, (...args: any[]) => Promise<unknown>>,
  sendEvent: (channelName: string, data: unknown) => void
) => {
  let evt: null | Electron.IpcMainEvent = null
  const channelName = createName(namespace)
  const message2call = createMessage2Call<T>({
    exposeObj,
    sendMessage(data) {
      sendEvent(channelName, data)
    },
    onCallBeforeParams(rawArgs) {
      return [evt, ...rawArgs]
    },
    isSendErrorStack: true,
    timeout: 0,
  })
  ipcMain.on(channelName, (event, data) => {
    evt = event
    message2call.message(data)
  })

  return {
    remote: message2call.remote,
    destroy: message2call.destroy,
  }
}
