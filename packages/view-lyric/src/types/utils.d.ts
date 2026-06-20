import type { Readable } from 'svelte/store'

declare global {
  type StoresValues<T> = T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never }
  // type StoreType<T> = T extends Readable<infer V> ? V : never
}
