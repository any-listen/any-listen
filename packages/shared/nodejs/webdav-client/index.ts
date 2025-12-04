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
    return isDir
      ? ({
          path: `${path}/${item.propstat.prop.displayname}`,
          isDir: true,
          name: item.propstat.prop.displayname,
          lastModified: new Date(item.propstat.prop.getlastmodified).getTime(),
        } satisfies WebDAVDirItem)
      : ({
          path: `${path}/${item.propstat.prop.displayname}`,
          name: item.propstat.prop.displayname,
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
    const res = await request<string>(url, {
      method,
      headers,
      ...options,
    })
    const contentType = res.headers['content-type']?.toString() ?? ''
    if (!res.statusCode || res.statusCode > 299) {
      if (res.body && contentType.includes('xml')) {
        const error = this.xmlParser.parse(res.body)
        throw this.handleRequestError(url, method, res.statusCode, JSON.stringify(error) || '')
      }
      throw this.handleRequestError(url, method, res.statusCode, res.body)
    }
    if (method === 'HEAD') return res.headers as T
    if (contentType.includes('xml')) {
      return this.xmlParser.parse(res.body) as T
    }
    return (options.needRaw ? res.raw : res.body) as T
  }

  getRequestOptions(path: string, method: Options['method'] = 'GET'): [string, Options] {
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
    if (!path.startsWith('/')) path = `/${path}`
    const res = await this.request<Ls>('PROPFIND', { headers: { Depth: '1' }, path })
    // console.log(JSON.stringify(res.multistatus.response))
    res.multistatus.response.shift()
    if (path == '/') return buildFileItems(res.multistatus.response, '')
    return buildFileItems(res.multistatus.response, path)
  }

  async rm(path: string) {
    return this.request('DELETE', { path })
  }

  async mkdir(path: string) {
    return this.request('MKCOL', { path })
  }

  async mv(src: string, dest: string) {
    return this.request('MOVE', { headers: { Destination: this.baseUrl + dest }, path: src })
  }

  async cp(src: string, dest: string) {
    return this.request('COPY', { headers: { Destination: this.baseUrl + dest }, path: src })
  }

  async get(path: string) {
    const res = await this.request<Uint8Array>('GET', { needRaw: true, path })
    return Buffer.from(res)
  }

  async getHead(path: string) {
    return this.request<Response<string>['headers']>('HEAD', { needRaw: true, path })
  }

  async put(path: string, data: Buffer | string) {
    return this.request('PUT', {
      path,
      binary: data instanceof Buffer ? data : await readFile(data),
    })
  }

  async getStream(path: string, rangeStart?: string, rangeEnd?: string) {
    const res = await this.request<Readable>('GET', {
      needBody: true,
      path,
      headers: rangeStart || rangeEnd ? { Range: `bytes=${rangeStart}-${rangeEnd}` } : undefined,
    })
    return res
  }

  async getPartial(path: string, start: number | null, end?: number | null) {
    const res = await this.request<Uint8Array>('GET', {
      needRaw: true,
      path,
      headers: { Range: `bytes=${start || '0'}-${end || ''}` },
    })
    return Buffer.from(res)
  }
}
