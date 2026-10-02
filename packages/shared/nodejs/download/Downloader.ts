import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import type http from 'node:http'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { type Options as RequestOptions, request } from './request'
import { STATUS } from './util'

export interface Options {
  timeout: number
  requestOptions: RequestOptions
}

const defaultChunkInfo = {
  path: '',
  startByte: '0',
  endByte: '',
}

const defaultRequestOptions: Options['requestOptions'] = {
  method: 'get',
  headers: {},
}
const defaultOptions: Options = {
  timeout: 20_000,
  requestOptions: { ...defaultRequestOptions },
}

class Task extends EventEmitter {
  resumeLastChunk: Buffer | null
  downloadUrl: string
  chunkInfo: { savePath: string; startByte: string; endByte: string }
  status: (typeof STATUS)[keyof typeof STATUS]
  options: Options
  requestOptions: Options['requestOptions']
  ws: fs.WriteStream | null = null
  progress = { total: 0, downloaded: 0, speed: 0, progress: 0 }
  statsEstimate = { time: 0, bytes: 0, prevBytes: 0 }
  requestInstance: http.ClientRequest | null = null
  maxRedirectNum = 2
  private redirectNum = 0
  private dataWriteQueueLength = 0
  private closePromise: Promise<void> | null = null
  private initPromise: Promise<void> | null = null
  private totalKnown = false
  private generation = 0
  private resumeRestarts = 0
  private timeout: null | NodeJS.Timeout = null

  constructor(url: string, savePath: string, options: Partial<Options> = {}) {
    super()

    this.resumeLastChunk = null
    this.downloadUrl = url
    this.chunkInfo = {
      ...defaultChunkInfo,
      savePath,
      startByte: '0',
    }
    // if (!this.chunkInfo.endByte) this.chunkInfo.endByte = ''

    this.options = { ...defaultOptions, ...options }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.requestOptions = { ...defaultRequestOptions, ...(this.options.requestOptions || {}) }
    this.requestOptions.headers = this.requestOptions.headers ? { ...this.requestOptions.headers } : {}

    this.status = STATUS.idle
  }

  async __init(generation: number) {
    const { savePath, startByte, endByte } = this.chunkInfo
    const isCurrent = () => generation === this.generation && this.status === STATUS.init
    this.redirectNum = 0
    this.resumeLastChunk = null
    delete this.requestOptions.headers!.range
    this.progress.downloaded = 0
    this.progress.total = 0
    this.progress.progress = 0
    this.progress.speed = 0
    this.dataWriteQueueLength = 0
    this.closePromise = null
    this.__clearTimeout()
    this.__startTimeout()
    if (startByte !== '0') this.requestOptions.headers!.range = `bytes=${startByte}-${endByte}`

    if (!savePath) return
    const stats = await fs.promises.stat(savePath).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== 'ENOENT') throw err
      return undefined
    })
    if (!isCurrent()) return
    if (!stats) {
      await fs.promises.mkdir(path.dirname(savePath), { recursive: true })
    } else if (stats.size >= 10) {
      const file = await fs.promises.open(savePath, 'r')
      try {
        if (!isCurrent()) return
        const { buffer, bytesRead } = await file.read(Buffer.alloc(10), 0, 10, stats.size - 10)
        if (!isCurrent()) return
        if (bytesRead !== 10) throw new Error('Invalid download partial file')
        this.resumeLastChunk = buffer
        this.progress.downloaded = stats.size
        this.requestOptions.headers!.range = `bytes=${stats.size - 10}-${endByte || ''}`
      } finally {
        await file.close()
      }
    } else if (stats.size) {
      await fs.promises.truncate(savePath)
    }
  }

  __httpFetch(url: string, options: Options['requestOptions']) {
    const generation = this.generation
    let redirected = false
    let receivedResponse = false
    this.requestInstance = request(url, options)
      .on('response', (response) => {
        receivedResponse = true
        if (generation !== this.generation || this.status !== STATUS.running) {
          response.destroy()
          return
        }
        if (response.statusCode !== 200 && response.statusCode !== 206) {
          if (response.statusCode === 416 && this.progress.downloaded) {
            response.destroy()
            void this.__restartFromBeginning()
            return
          }
          if (
            (response.statusCode == 301 || response.statusCode == 302) &&
            response.headers.location &&
            this.redirectNum < this.maxRedirectNum
          ) {
            console.log('current url:', url)
            console.log('redirect to:', response.headers.location)
            redirected = true
            this.redirectNum++
            response.resume()
            try {
              this.__httpFetch(new URL(response.headers.location, url).href, options)
            } catch (err) {
              this.__handleError(err as Error)
            }
            return
          }
          this.status = STATUS.failed
          this.__clearTimeout()
          this.__closeRequest()
          void this.__closeWriteStream()
            .then(() => {
              if (generation === this.generation && this.status === STATUS.failed) this.emit('fail', response)
            })
            .catch((err: Error) => this.__handleError(err))
          return
        }
        this.emit('response', response)
        try {
          this.__initDownload(response)
        } catch (error) {
          if ((error as Error).message === 'Invalid resume response') {
            response.destroy()
            void this.__restartFromBeginning()
          } else this.__handleError(error as Error)
          return
        }
        this.status = STATUS.running
        this.__startTimeout()
        response
          .on('data', (chunk: Buffer) => {
            if (generation === this.generation) this.__handleWriteData(chunk)
          })
          .on('error', (err) => {
            if (generation === this.generation) this.__handleError(err)
          })
          .on('aborted', () => {
            if (generation === this.generation) this.__handleError(new Error('aborted'))
          })
          .on('end', () => {
            if (generation !== this.generation) return
            if (response.complete) {
              this.__handleComplete()
            } else {
              this.__handleError(new Error('The connection was terminated while the message was still being sent'))
            }
          })
      })
      .on('error', (err) => {
        if (generation === this.generation) this.__handleError(err)
      })
      .on('close', () => {
        if (redirected || generation !== this.generation) return
        if (!receivedResponse && this.status === STATUS.running) this.__handleError(new Error('Connection closed'))
      })
      .end()
  }

  __initDownload(response: http.IncomingMessage) {
    this.progress.total = response.headers['content-length'] ? parseInt(response.headers['content-length']) : 0
    this.totalKnown = response.headers['content-length'] != null
    if (this.totalKnown && (!Number.isFinite(this.progress.total) || this.progress.total <= 0)) {
      throw new Error('Content length is 0 or invalid')
    }
    const options: NonNullable<Parameters<typeof fs.createWriteStream>[1]> = { flags: 'w' }
    const resumed = this.progress.downloaded > 0
    if (response.statusCode === 206) {
      const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers['content-range'] ?? '')
      const expectedStart = resumed ? this.progress.downloaded - 10 : Number(this.chunkInfo.startByte)
      if (
        !range ||
        Number(range[1]) !== expectedStart ||
        Number(range[2]) < expectedStart ||
        Number(range[3]) <= Number(range[2]) ||
        (this.totalKnown && Number(range[2]) - expectedStart + 1 !== this.progress.total)
      ) {
        throw new Error('Invalid resume response')
      }
      this.progress.total = Number(range[3])
      this.totalKnown = true
      if (resumed) options.flags = 'a'
    } else {
      // A server may ignore Range. Replace the partial file with the full response.
      if (this.chunkInfo.startByte !== '0') throw new Error('The resource cannot be resumed download.')
      this.progress.downloaded = 0
      this.resumeLastChunk = null
    }
    this.statsEstimate.prevBytes = this.progress.downloaded
    if (!this.chunkInfo.savePath) {
      throw new Error('Chunk save Path is not set.')
    }
    this.ws = fs.createWriteStream(this.chunkInfo.savePath, options)

    const generation = this.generation
    this.ws.on('error', (err) => {
      if (generation === this.generation) this.__handleError(err)
    })
  }

  __handleComplete() {
    const generation = this.generation
    if (this.status !== STATUS.running) return
    this.__clearTimeout()
    void this.__closeWriteStream()
      .then(() => {
        if (generation !== this.generation || this.status !== STATUS.running) return
        if (!this.totalKnown) this.progress.total = this.progress.downloaded
        if (this.progress.downloaded == this.progress.total) {
          this.status = STATUS.completed
          this.emit('completed')
        } else {
          this.__handleError(new Error('Incomplete download response'))
        }
      })
      .catch((err: Error) => this.__handleError(err))
    // console.log('end')
  }

  __handleError(error: Error) {
    const generation = this.generation
    if (this.status == STATUS.error || this.status == STATUS.completed || this.status == STATUS.stopped) return
    this.status = STATUS.error
    this.__clearTimeout()
    this.__closeRequest()
    // Notify callers only after the file descriptor closes, so cleanup is safe on Windows too.
    void this.__closeWriteStream().then(
      () => {
        if (generation === this.generation && this.status === STATUS.error) this.emit('error', error)
      },
      () => {
        if (generation === this.generation && this.status === STATUS.error) this.emit('error', error)
      }
    )
  }

  async __closeWriteStream() {
    if (this.closePromise) return this.closePromise
    const ws = this.ws
    if (!ws || ws.closed) return
    this.closePromise = new Promise<void>((resolve, reject) => {
      let writeError: Error | undefined
      const onError = (err: Error) => {
        writeError = err
      }
      ws.on('error', onError)
      ws.once('close', () => {
        ws.off('error', onError)
        this.ws = null
        if (writeError) reject(writeError)
        else resolve()
      })
      if (!ws.destroyed && !ws.writableEnded) ws.end()
    })
    return this.closePromise
  }

  __closeRequest() {
    if (!this.requestInstance || this.requestInstance.destroyed) return
    // console.log('close request')
    this.requestInstance.destroy()
    this.requestInstance = null
  }

  __handleWriteData(chunk: Buffer) {
    if (this.status !== STATUS.running || this.ws == null) return
    if (this.resumeLastChunk) {
      const result = this.__handleDiffChunk(chunk)
      if (result) chunk = result
      else {
        void this.__restartFromBeginning()
        return
      }
    }
    this.dataWriteQueueLength++
    this.__startTimeout()
    this.__calculateProgress(chunk.length)
    const generation = this.generation
    this.ws.write(chunk, (err) => {
      if (generation !== this.generation) return
      this.dataWriteQueueLength--
      if (this.status == STATUS.running) this.__calculateProgress(0)
      if (err) {
        console.log(err)
        this.__handleError(err)
        return
      }
    })
  }

  __handleDiffChunk(chunk: Buffer): Buffer | null {
    // console.log('diff', chunk)
    let resumeLastChunkLen = this.resumeLastChunk!.length
    let chunkLen = chunk.length
    let isOk
    if (chunkLen >= resumeLastChunkLen) {
      isOk = chunk.subarray(0, resumeLastChunkLen).toString('hex') === this.resumeLastChunk!.toString('hex')
      if (!isOk) return null

      this.resumeLastChunk = null
      return chunk.subarray(resumeLastChunkLen)
    }
    isOk = chunk.subarray(0, chunkLen).toString('hex') === this.resumeLastChunk!.subarray(0, chunkLen).toString('hex')
    if (!isOk) return null
    this.resumeLastChunk = this.resumeLastChunk!.subarray(chunkLen)
    return chunk.subarray(chunkLen)
  }

  async __handleStop() {
    this.__clearTimeout()
    this.__closeRequest()
    return this.__closeWriteStream()
  }

  private __clearTimeout() {
    if (!this.timeout) return
    clearTimeout(this.timeout)
    this.timeout = null
  }

  private __startTimeout() {
    this.__clearTimeout()
    this.timeout = setTimeout(() => {
      this.__handleError(new Error('download timeout'))
    }, this.options.timeout)
  }

  __calculateProgress(receivedBytes: number) {
    const currentTime = performance.now()
    const elaspsedTime = currentTime - this.statsEstimate.time

    const progress = this.progress
    progress.downloaded += receivedBytes
    progress.progress = progress.total ? (progress.downloaded / progress.total) * 100 : -1

    // emit the progress every second or if finished
    if ((progress.downloaded === progress.total && this.dataWriteQueueLength == 0) || elaspsedTime > 1000) {
      this.statsEstimate.time = currentTime
      this.statsEstimate.bytes = progress.downloaded - this.statsEstimate.prevBytes
      this.statsEstimate.prevBytes = progress.downloaded
      this.emit('progress', {
        total: progress.total,
        downloaded: progress.downloaded,
        progress: progress.progress,
        speed: this.statsEstimate.bytes,
        writeQueue: this.dataWriteQueueLength,
      })
    }
  }

  private async __restartFromBeginning() {
    if (this.status !== STATUS.running) return
    if (this.resumeRestarts++ > 0) {
      this.__handleError(new Error('Invalid resume response'))
      return
    }
    const generation = ++this.generation
    this.status = STATUS.init
    try {
      await this.__handleStop()
      if (generation !== this.generation) return
      await fs.promises.truncate(this.chunkInfo.savePath).catch((err: NodeJS.ErrnoException) => {
        if (err.code !== 'ENOENT') throw err
      })
      if (generation !== this.generation) return
      this.chunkInfo.startByte = '0'
      await this.start(false)
    } catch (err) {
      if (generation === this.generation) this.__handleError(err as Error)
    }
  }

  async start(resetRestarts = true) {
    const generation = ++this.generation
    if (resetRestarts) this.resumeRestarts = 0
    this.status = STATUS.init
    const initialized = this.__init(generation)
    this.initPromise = initialized
    try {
      await initialized
    } catch (err) {
      if (generation === this.generation) throw err
      return
    } finally {
      if (this.initPromise === initialized) this.initPromise = null
    }
    if (generation !== this.generation || this.status !== STATUS.init) return
    this.status = STATUS.running
    this.__httpFetch(this.downloadUrl, this.requestOptions)
    this.emit('start')
  }

  async stop() {
    if (this.status === STATUS.completed) return
    if (this.status === STATUS.stopped) {
      await this.__closeWriteStream()
      await this.initPromise?.catch(() => {})
      return
    }
    ++this.generation
    this.status = STATUS.stopped
    await this.__handleStop()
    await this.initPromise?.catch(() => {})
    this.emit('stop')
  }

  refreshUrl(url: string) {
    this.downloadUrl = url
  }

  updateSaveInfo(filePath: string, fileName: string) {
    this.chunkInfo.savePath = path.join(filePath, fileName)
  }
}

export default Task
