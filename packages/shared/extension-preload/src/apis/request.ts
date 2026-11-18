// import { hostCallActions } from '@/host/hostActions'
import { hostContext } from '@/host/state'
import { generateId } from '@/utils'

const requestQueue = new Map<string, (err: Error) => void>()

export const request: AnyListen_API.API['request'] = async (url, { signal, ...options } = {}) => {
  // 丢弃调用方自带的 requestKey，防止跨扩展干扰 host 端的取消登记
  if ('requestKey' in options) delete options.requestKey
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
      void hostContext.hostFuncs
        .request(url, { ...options, requestKey })
        // @ts-expect-error
        .then(resolve)
        .catch(reject)
        .finally(() => {
          // 请求已结束时移除登记，之后 signal 再 abort 只是空操作
          requestQueue.delete(requestKey)
        })
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
