import { cloneData } from '@any-listen/common/utils'
import { request as rawRequest } from '@any-listen/nodejs/request'

type RequestOptions = Omit<AnyListen.IPCExtension.RequestOptions, 'signal'> & { requestKey?: string }
type Response<Resp> = AnyListen.IPCExtension.Response<Resp>
// type RespCallback<Resp> = AnyListen.IPCExtension.RespCallback<Resp>

const requestSignalMap = new Map<string, AbortController>()
const request = async <Resp = unknown>(url: string, options: RequestOptions = {}): Promise<Response<Resp>> => {
  options = cloneData(options)
  let signal: AbortSignal | undefined
  if (options.requestKey) {
    const controller = new AbortController()
    requestSignalMap.set(options.requestKey, controller)
    signal = controller.signal
  }
  return rawRequest<Resp>(url, {
    signal,
    method: options.method,
    headers: options.headers,
    query: options.query,
    json: options.json,
    form: options.form,
    binary: options.binary,
    formdata: options.formdata,
    needRaw: options.needRaw,
    text: options.text,
    xml: options.xml,
    timeout: options.timeout,
    maxRedirect: options.maxRedirect,
  })
    .then((resp) => {
      // console.log(resp.body)
      return {
        body: resp.body,
        headers: resp.headers,
        raw: resp.raw,
        statusCode: resp.statusCode,
      }
    })
    .finally(() => {
      if (options.requestKey) requestSignalMap.delete(options.requestKey)
    })
}
const cancelRequest = (requestKey: string) => {
  const controller = requestSignalMap.get(requestKey)
  if (!controller) return
  controller.abort()
  requestSignalMap.delete(requestKey)
}

export const createRequest = (extension: AnyListen.Extension.Extension) => {
  const req = {
    request,
    cancelRequest,
  } as const
  if (extension.grant.includes('internet')) return req
  return {} as unknown as typeof req
}
