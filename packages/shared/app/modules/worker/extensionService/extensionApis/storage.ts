import { joinPath } from '@any-listen/nodejs'
import Store from '@any-listen/nodejs/Store'

import { extensionEvent } from '../event'

export const createStore = (path: string) => {
  let store: Store
  const initStore = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (store) return
    try {
      store = new Store(joinPath(path, 'data.json'), false, true)
    } catch (err: unknown) {
      extensionEvent.error(`init store error: ${(err as Error).stack ?? (err as Error).message}`)
      store = new Store(path, true, true)
    }
  }

  return {
    async getItems(keys: string[]) {
      initStore()
      return keys.map((k) => store.get(k)) as string[]
    },
    async setItems<T extends Array<[string, string]>>(datas: T) {
      initStore()
      for (const [k, v] of datas) store.set(k, v)
    },
    async removeItems(keys: string[]) {
      initStore()
      for (const k of keys) store.delete(k)
    },
    async clearItems() {
      initStore()
      store.override({})
    },
  }
}
