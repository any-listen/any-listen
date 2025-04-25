import { request as rawRequest } from '@any-listen/nodejs/request'
import { cloneData } from './shared'

type RequestOptions = AnyListen.IPCExtension.RequestOptions
type Response<Resp> = AnyListen.IPCExtension.Response<Resp>
// type RespCallback<Resp> = AnyListen.IPCExtension.RespCallback<Resp>

export const request = async <Resp = unknown>(url: string, options: RequestOptions = {}): Promise<Response<Resp>> => {
  options = cloneData(options)
  return rawRequest<Resp>(url, {
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
  }).then((resp) => {
    // console.log(resp.body)
    return {
      body: resp.body,
      headers: resp.headers,
      raw: resp.raw,
      statusCode: resp.statusCode,
    }
  })
}
