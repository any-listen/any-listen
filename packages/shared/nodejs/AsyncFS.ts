import path from 'node:path'
import fs from 'node:fs/promises'

export default class Store {
  private readonly filePath: string
  private readonly dirPath: string
  private readonly batch: boolean
  private immediate: NodeJS.Immediate | null = null
  private data: string | Record<string, unknown> | Buffer | Uint8Array | null = null
  private runing = false

  private getFormatData() {
    if (this.data) {
      if (typeof this.data === 'object') return JSON.stringify(this.data, null, '\t')
      return this.data
    }
    return ''
  }
  private async handleWriteFile() {
    this.runing = true
    const tempPath = `${this.filePath}.${Math.random().toString().substring(2, 10)}.temp`
    try {
      await fs.writeFile(tempPath, this.getFormatData(), 'utf8')
      this.data = null
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        try {
          await fs.mkdir(this.dirPath, { recursive: true })
          await fs.writeFile(tempPath, this.getFormatData(), 'utf8')
          this.data = null
        } catch (err) {
          this.data = null
          throw err as Error
        } finally {
          this.runing = false
        }
      } else {
        this.data = null
        throw err as Error
      }
    } finally {
      this.runing = false
    }
    await fs.rename(tempPath, this.filePath)
  }

  constructor(filePath: string, batch = false) {
    this.filePath = filePath
    this.batch = batch
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
    if (this.runing) return
    if (this.batch) {
      this.immediate ??= setImmediate(() => {
        this.immediate = null
        void this.handleWriteFile()
      })
    } else void this.handleWriteFile()
  }
}
