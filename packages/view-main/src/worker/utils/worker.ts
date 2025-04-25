import { createMessage2Call, type ReadObj } from 'message2call'

export const exposeWorker = (obj: ReadObj) => {
  const message2call = createMessage2Call<{ inited: () => void }>({
    exposeObj: obj,
    isSendErrorStack: true,
    timeout: 0,
    sendMessage(data) {
      postMessage(data)
    },
  })
  onmessage = (event) => {
    message2call.message(event.data)
  }

  return message2call
}
