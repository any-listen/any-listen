import type http from 'node:http'

import { sizeFormate } from '@any-listen/common/utils'

import Downloader, { type Options as DownloaderOptions } from './Downloader'
import { getRequestAgent } from './util'

// these are the default options
// const options = {
//   method: 'GET', // Request Method Verb
//   // Custom HTTP Header ex: Authorization, User-Agent
//   headers: {},
//   fileName: '', // Custom filename when saved
//   override: false, // if true it will override the file, otherwise will append '(number)' to the end of file
//   // httpRequestOptions: {}, // Override the http request options
//   // httpsRequestOptions: {}, // Override the https request options, ex: to add SSL Certs
// }

export interface Options {
  url: string
  path: string
  method?: DownloaderOptions['requestOptions']['method']
  headers?: DownloaderOptions['requestOptions']['headers']
  proxy?: { host: string; port: number }
  onCompleted?: () => void
  onError?: (error: Error) => void
  onFail?: (response: http.IncomingMessage) => void
  onStart?: () => void
  onStop?: () => void
  onProgress?: (progress: AnyListen.Download.ProgressInfo) => void
}
const noop = () => {}
export const createDownload = ({
  url,
  path,
  method = 'get',
  proxy,
  headers = {},
  // resumeTime = 5000,
  onCompleted = noop,
  onError = noop,
  onFail = noop,
  onStart = noop,
  onStop = noop,
  onProgress = noop,
}: Options) => {
  const dl = new Downloader(url, path, {
    requestOptions: {
      method,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        ...headers,
      },
      agent: getRequestAgent(url, proxy),
      timeout: 60 * 1000,
    },
  })

  dl.on('completed', () => {
    onCompleted()
  })
    .on('error', (err: Error) => {
      onError(err)
    })
    .on('start', () => {
      onStart()
      // pauseResumeTimer(dl, resumeTime)
    })
    .on('progress', (stats) => {
      const speed = sizeFormate(stats.speed)
      onProgress({
        progress: Number(stats.progress.toFixed(2)),
        speed,
        downloaded: stats.downloaded,
        total: stats.total,
        writeQueue: stats.writeQueue,
      })
      // if (debugDownload) {
      //   const downloaded = sizeFormate(stats.downloaded)
      //   const total = sizeFormate(stats.total)
      //   console.log(`${speed}/s - ${progress}% [${downloaded}/${total}]`)
      // }
    })
    .on('stop', () => {
      onStop()
      // debugDownload && console.log('paused')
    })
    .on('fail', (resp) => {
      onFail(resp)
      // debugDownload && console.log('fail')
    })

  // debugDownload && console.log('Downloading: ', url)

  dl.start().catch((err) => {
    dl.__handleError(err as Error)
  })

  return dl
}

export interface SimpleDownloadOptions {
  proxy: Options['proxy']
  onProgress: Options['onProgress']
  headers: Options['headers']
}
export const simpleDownload = async (url: string, path: string, options: Partial<SimpleDownloadOptions> = {}) => {
  return new Promise<void>((resolve, reject) => {
    createDownload({
      url,
      path,
      headers: options.headers,
      proxy: options.proxy,
      onProgress: options.onProgress,
      onCompleted() {
        resolve()
      },
      onError(err) {
        reject(err)
      },
      onFail(resp) {
        reject(new Error(`request error: ${resp.statusMessage}`))
      },
      onStop() {
        reject(new Error('request stopped'))
      },
    })
  })
}

export type DownloaderType = Downloader
