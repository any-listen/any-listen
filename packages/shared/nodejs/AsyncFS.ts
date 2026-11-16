import fs from 'node:fs/promises'
import path from 'node:path'

export interface StoreOptions {
  /** 是否批量写入，开启后多次调用writeFile只会写入一次 */
  batch?: boolean
  /** 是否安全写入，开启后会先写入临时文件再重命名 */
  safeWrite?: boolean
}

export default class Store {
  private readonly filePath: string
  private readonly dirPath: string
  private readonly batch: boolean
  private readonly safeWrite: boolean
  private immediate: NodeJS.Immediate | null = null
  private data: string | Record<string, unknown> | Buffer | Uint8Array | null = null
  private running = false
  private writePromise: Promise<void> = Promise.resolve()

  private getFormatData(data: string | Record<string, unknown> | Buffer | Uint8Array | null) {
    if (data) {
      if (typeof data === 'object') return JSON.stringify(data, null, '\t')
      return data
    }
    return ''
  }
  private async handleWriteFile(data: string | Record<string, unknown> | Buffer | Uint8Array | null) {
    try {
      if (this.safeWrite) {
        const tempPath = `${this.filePath}.${Math.random().toString().substring(2, 10)}.temp`
        await fs.writeFile(tempPath, this.getFormatData(data), 'utf8')
        await fs.rename(tempPath, this.filePath)
      } else {
        await fs.writeFile(this.filePath, this.getFormatData(data), 'utf8')
      }
    } catch (err) {
      if (this.safeWrite && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.mkdir(this.dirPath, { recursive: true })
        const tempPath = `${this.filePath}.${Math.random().toString().substring(2, 10)}.temp`
        await fs.writeFile(tempPath, this.getFormatData(data), 'utf8')
        await fs.rename(tempPath, this.filePath)
      } else {
        throw err as Error
      }
    }
  }

  private flush(): Promise<void> {
    if (this.running) return this.writePromise.then(() => this.flush())
    if (this.data == null) return this.writePromise
    const data = this.data
    this.data = null
    this.running = true
    this.writePromise = this.handleWriteFile(data)
      .catch((err) => {
        console.error('write file error:', err)
      })
      .finally(() => {
        this.running = false
      })
    return this.writePromise
  }

  constructor(filePath: string, options: StoreOptions = {}) {
    this.filePath = filePath
    this.batch = options.batch ?? false
    this.safeWrite = options.safeWrite ?? true
    this.dirPath = path.dirname(this.filePath)
  }

  async readFile(): Promise<Buffer | null> {
    if (
      await fs
        .access(this.filePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
    ) {
      return fs.readFile(this.filePath)
    }
    return null
  }
  writeFile(data: string | Record<string, unknown> | Buffer | Uint8Array) {
    this.data = data
    if (this.batch) {
      this.immediate ??= setImmediate(() => {
        this.immediate = null
        void this.flush()
      })
    } else void this.flush()
  }
}
