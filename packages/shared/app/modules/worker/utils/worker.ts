import { MessagePort, parentPort } from 'node:worker_threads'

import { createMessage2Call, type ReadObj } from 'message2call'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exposeWorker = async <T extends Record<string, any>>(obj: ReadObj) => {
  return new Promise<ReturnType<typeof createMessage2Call<T>>>((resolve, reject) => {
    const handlePortMessage = (port?: MessagePort) => {
      if (!port || !(port instanceof MessagePort)) return

      const message2call = createMessage2Call<T>({
        exposeObj: obj,
        isSendErrorStack: true,
        timeout: 0,
        sendMessage(data) {
          port.postMessage(data)
        },
      })
      port.on('message', (message) => {
        message2call.message(message)
      })

      resolve(message2call)
    }
    parentPort?.once('message', handlePortMessage)
  })
}
