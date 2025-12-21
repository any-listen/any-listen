import { XMLParser } from 'fast-xml-parser'
import { readFile } from 'node:fs/promises'
import type { Readable } from 'node:stream'
import { request, type Options, type Response } from '../request'
import type { Ls, Response as LsResp } from './types/ls'

export interface WebDAVClientOptions {
  baseUrl: string
  username?: string
  password?: string
  onError?: (errorMessage: string) => void
  onDebugLog?: (logMessage: string) => void
}

export interface WebDAVDirItem {
  path: string
  name: string
  isDir: true
  lastModified: number
}
export interface WebDAVFileItem {
  path: string
  name: string
  isDir: false
  lastModified: number
  contentType: string
  size: number
}
export type WebDAVItem = WebDAVDirItem | WebDAVFileItem

const buildFileItems = (list: LsResp[], path: string): WebDAVItem[] => {
  return list.map((item) => {
    const isDir = item.propstat.prop.resourcetype?.collection === ''
    let rawName: string
    let name: string
    if (item.propstat.prop.displayname == null) {
      rawName = item.href.endsWith('/') ? item.href.slice(0, -1) : item.href
      rawName = rawName.substring(rawName.lastIndexOf('/') + 1)
      name = decodeURIComponent(rawName)
    } else {
      rawName = encodeURIComponent(item.propstat.prop.displayname)
      name = item.propstat.prop.displayname
    }

    return isDir
      ? ({
          path: `${path}/${rawName}`,
          isDir: true,
          name,
          lastModified: new Date(item.propstat.prop.getlastmodified).getTime(),
        } satisfies WebDAVDirItem)
      : ({
          path: `${path}/${rawName}`,
          name,
          isDir: false,
          lastModified: new Date(item.propstat.prop.getlastmodified).getTime(),
          contentType: item.propstat.prop.getcontenttype,
          size: parseInt(item.propstat.prop.getcontentlength),
        } satisfies WebDAVFileItem)
  })
}
const buildError = (statusCode?: number, error?: string) => {
  return new Error(`${statusCode}${error ? `, ${error}` : ''}`)
}

export class WebDAVClient {
  private readonly options: WebDAVClientOptions
  private readonly baseUrl: string
  private readonly authHeader?: string
  private readonly xmlParser: XMLParser

  constructor(options: WebDAVClientOptions) {
    this.options = options
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    if (options.username) {
      const token = Buffer.from(`${options.username}:${options.password || ''}`).toString('base64')
      this.authHeader = `Basic ${token}`
    }
    this.xmlParser = new XMLParser({
      ignoreAttributes: true,
      attributeNamePrefix: '',
      parseTagValue: false,
      removeNSPrefix: true,
      trimValues: false,
    })
  }

  private handleRequestError(url: string, method: Options['method'], statusCode?: number, body?: string) {
    const error = buildError(statusCode, body)
    if (statusCode != 404) {
      try {
        this.options.onError?.(`[${method} ${url}] ${error.message}`)
      } catch {}
    }
    return error
  }

  private async request<T = unknown>(
    method: Options['method'],
    { path, ...options }: Omit<Options, 'method'> & { path?: string } = {}
  ) {
    const headers = options.headers || {}
    if (this.authHeader) headers.Authorization = this.authHeader
    const url = path ? `${this.baseUrl}${path}` : this.baseUrl
    this.options.onDebugLog?.(`request: [${method} ${url}]`)
    const res = await request<string>(url, {
      method,
      headers,
      ...options,
    }).catch((err: Error) => {
      this.options.onDebugLog?.(`request error: [${method} ${url}] ${err.message} ${err.stack || ''}`)
      throw err
    })
    const contentType = res.headers['content-type']?.toString() ?? ''
    if (!res.statusCode || res.statusCode > 299) {
      if (res.body && contentType.includes('xml')) {
        const error = this.xmlParser.parse(res.body)
        this.options.onDebugLog?.(`request error: [${method} ${url} ${res.statusCode}] ${JSON.stringify(error) || ''}`)
        throw this.handleRequestError(url, method, res.statusCode, JSON.stringify(error) || '')
      }
      this.options.onDebugLog?.(`request error: [${method} ${url} ${res.statusCode}] ${res.body}`)
      throw this.handleRequestError(url, method, res.statusCode, res.body)
    }
    if (method === 'HEAD') {
      this.options.onDebugLog?.(
        `request: [${method} ${url} ${res.statusCode} ${contentType}] [${JSON.stringify(res.headers)}] ${res.body}`
      )
      return res.headers as T
    }
    if (contentType.includes('xml')) {
      const data = this.xmlParser.parse(res.body) as T
      this.options.onDebugLog?.(`request parsed: ${JSON.stringify(data)}`)
      return data
    }
    this.options.onDebugLog?.(
      `request: [${method} ${url} ${res.statusCode} ${contentType}] [${JSON.stringify(res.headers)}] ${res.body}`
    )
    return (options.needRaw ? res.raw : res.body) as T
  }

  getRequestOptions(path: string, method: Options['method'] = 'GET'): [string, Options] {
    this.options.onDebugLog?.(`getRequestOptions: [${path}]`)
    const url = path ? `${this.baseUrl}${path}` : this.baseUrl
    return [
      url,
      {
        method,
        headers: {
          Authorization: this.authHeader || '',
        },
      },
    ]
  }

  async ls(path = '/'): Promise<WebDAVItem[]> {
    this.options.onDebugLog?.(`ls: [${path}]`)
    if (!path.startsWith('/')) path = `/${path}`
    const res = await this.request<Ls>('PROPFIND', { headers: { Depth: '1' }, path })
    // console.log(JSON.stringify(res.multistatus.response))
    const responses = Array.isArray(res.multistatus.response) ? res.multistatus.response.slice() : [res.multistatus.response]
    responses.shift()
    if (path == '/') return buildFileItems(responses, '')
    return buildFileItems(responses, path)
  }

  async rm(path: string) {
    this.options.onDebugLog?.(`rm: [${path}]`)
    return this.request('DELETE', { path })
  }

  async mkdir(path: string) {
    this.options.onDebugLog?.(`mkdir: [${path}]`)
    return this.request('MKCOL', { path })
  }

  async mv(src: string, dest: string) {
    this.options.onDebugLog?.(`mv: [${src}] -> [${dest}]`)
    return this.request('MOVE', { headers: { Destination: this.baseUrl + dest }, path: src })
  }

  async cp(src: string, dest: string) {
    this.options.onDebugLog?.(`cp: [${src}] -> [${dest}]`)
    return this.request('COPY', { headers: { Destination: this.baseUrl + dest }, path: src })
  }

  async get(path: string) {
    this.options.onDebugLog?.(`get: [${path}]`)
    const res = await this.request<Uint8Array>('GET', { needRaw: true, path })
    return Buffer.from(res)
  }

  async getHead(path: string) {
    this.options.onDebugLog?.(`getHead: [${path}]`)
    return this.request<Response<string>['headers']>('HEAD', { needRaw: true, path })
  }

  async put(path: string, data: Buffer | string) {
    this.options.onDebugLog?.(`put: [${path}]`)
    return this.request('PUT', {
      path,
      binary: data instanceof Buffer ? data : await readFile(data),
    })
  }

  async getStream(path: string, rangeStart?: string, rangeEnd?: string) {
    this.options.onDebugLog?.(`getStream: [${path}] ${rangeStart || ''}-${rangeEnd || ''}`)
    const res = await this.request<Readable>('GET', {
      needBody: true,
      path,
      headers: rangeStart || rangeEnd ? { Range: `bytes=${rangeStart}-${rangeEnd}` } : undefined,
    })
    return res
  }

  async getPartial(path: string, start: number | null, end?: number | null) {
    this.options.onDebugLog?.(`getPartial: ${path}] [${start || ''}-${end || ''}`)
    const res = await this.request<Uint8Array>('GET', {
      needRaw: true,
      path,
      headers: { Range: `bytes=${start || '0'}-${end || ''}` },
    })
    return Buffer.from(res)
  }
}
