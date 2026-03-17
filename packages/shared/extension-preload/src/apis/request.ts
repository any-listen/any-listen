// import { hostCallActions } from '@/host/hostActions'
import { hostContext } from '@/host/state'
import { generateId } from '@/utils'

const requestQueue = new Map<string, (err: Error) => void>()

export const request: AnyListen_API.API['request'] = async (url, { signal, ...options } = {}) => {
  if (signal) {
    const requestKey = generateId()
    return new Promise((resolve, reject) => {
      requestQueue.set(requestKey, reject)
      // @ts-expect-error
      signal.once('abort', () => {
        const targetRequest = requestQueue.get(requestKey)
        if (!targetRequest) return
        requestQueue.delete(requestKey)
        void hostContext.hostFuncs.cancelRequest(requestKey)
      })
      // @ts-expect-error
      void hostContext.hostFuncs.request(url, options).then(resolve).catch(reject)
    })
  }
  return hostContext.hostFuncs.request(url, options)
}

// export const handleResponse = ({ requestKey, error, response }: AnyListen.ExtensionVM.PreloadCallActions['response']) => {
//   const targetRequest = requestQueue.get(requestKey)
//   if (!targetRequest) return
//   requestQueue.delete(requestKey)
//   targetRequest.requestInfo.aborted ||= true
//   // if (targetRequest.timeout) clearTimeout(targetRequest.timeout)
//   if (error == null) targetRequest.callback(null, response)
//   else targetRequest.callback(new Error(error), null)
// }
