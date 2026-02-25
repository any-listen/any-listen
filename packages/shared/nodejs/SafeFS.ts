import fs from 'node:fs'
import path from 'node:path'

export default class Store {
  private readonly filePath: string
  private readonly dirPath: string
  private readonly batch: boolean
  // eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
  private immediate: NodeJS.Immediate | null = null
  private data: string | Record<string, unknown> | Buffer | Uint8Array | null = null

  private getFormatData() {
    if (this.data) {
      if (Buffer.isBuffer(this.data) || this.data instanceof Uint8Array) return this.data
      if (typeof this.data === 'object') return JSON.stringify(this.data, null, '\t')
      return this.data
    }
    return ''
  }
  private handleWriteFile() {
    const tempPath = `${this.filePath}.${Math.random().toString().substring(2, 10)}.temp`
    try {
      fs.writeFileSync(tempPath, this.getFormatData())
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        fs.mkdirSync(this.dirPath, { recursive: true })
        fs.writeFileSync(tempPath, this.getFormatData())
      } else throw err as Error
    } finally {
      this.data = null
    }
    fs.renameSync(tempPath, this.filePath)
  }

  constructor(filePath: string, batch = false) {
    this.filePath = filePath
    this.batch = batch
    this.dirPath = path.dirname(this.filePath)
  }

  readFile() {
    if (fs.existsSync(this.filePath)) {
      return fs.readFileSync(this.filePath)
    }
    return null
  }
  writeFile(data: string | Record<string, unknown> | Buffer | Uint8Array) {
    this.data = data
    if (this.batch) {
      this.immediate ??= setImmediate(() => {
        this.immediate = null
        this.handleWriteFile()
      })
    } else this.handleWriteFile()
  }
}
