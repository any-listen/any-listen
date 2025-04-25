import SafeFS from './SafeFS'

export default class Store {
  private store: Record<string, unknown>
  private readonly safaFS: SafeFS

  private writeFile() {
    this.safaFS.writeFile(this.store)
  }

  private readStore() {
    const data = this.safaFS.readFile()
    return data ? (JSON.parse(data.toString()) as Record<string, unknown>) : {}
  }
  constructor(filePath: string, clearInvalidConfig = false, batch = false) {
    this.safaFS = new SafeFS(filePath, batch)

    let store: Record<string, unknown>
    if (clearInvalidConfig) {
      try {
        store = this.readStore()
      } catch {
        store = {}
      }
    } else store = this.readStore()

    if (typeof store != 'object') {
      if (clearInvalidConfig) store = {}
      else throw new Error(`parse data error: ${String(store)}`)
    }
    this.store = store
  }

  get<V>(key: string): V | null {
    return (this.store[key] as V) ?? null
  }

  getAll<V extends object>() {
    return this.store as V
  }

  has(key: string): boolean {
    return key in this.store
  }

  set<V = unknown>(key: string, value: V) {
    this.store[key] = value
    this.writeFile()
  }

  delete(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.store[key]
    this.writeFile()
  }

  override(value: object) {
    this.store = value as Record<string, unknown>
    this.writeFile()
  }
}
