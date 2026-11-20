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
  private data: string | Record<string, unknown> | null = null
  // eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
  private immediate: NodeJS.Immediate | null = null
  private running = false

  private static getFormatData(data: string | Record<string, unknown>) {
    if (data) {
      if (typeof data === 'object') return JSON.stringify(data, null, '\t')
      return data
    }
    return ''
  }
  private async handleWriteFile(data: string | Record<string, unknown>) {
    if (this.safeWrite) {
      const tempPath = `${this.filePath}.${Math.random().toString().substring(2, 10)}.temp`
      try {
        await fs.writeFile(tempPath, Store.getFormatData(data), 'utf8')
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          await fs.mkdir(this.dirPath, { recursive: true })
          await fs.writeFile(tempPath, Store.getFormatData(data), 'utf8')
        } else {
          throw err as Error
        }
      }
      await fs.rename(tempPath, this.filePath).catch(async (err) => {
        console.error('Failed to rename temp file to target file:', err)
        void fs.unlink(tempPath)
      })
    } else {
      await fs.writeFile(this.filePath, Store.getFormatData(data), 'utf8')
    }
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

  private flush() {
    if (this.data === null || this.running) return
    this.running = true
    const d = this.data
    this.data = null
    void this.handleWriteFile(d).finally(() => {
      this.running = false
      if (this.data !== null) this.flush()
    })
  }
  writeFile(data: string | Record<string, unknown>) {
    this.data = data
    if (this.batch) {
      this.immediate ??= setImmediate(() => {
        this.immediate = null
        this.flush()
      })
    } else this.flush()
  }
}
