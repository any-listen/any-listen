import { updateExtensionSettings } from '../shared'
import { getConfig } from '../shared/configStore'

type WithUndefined<T extends readonly unknown[]> = {
  [K in keyof T]: T[K] | undefined
}
export const createConfigurationStore = (extension: AnyListen.Extension.Extension) => {
  return {
    async getConfigs<T extends unknown[] = []>(keys: string[]) {
      const store = await getConfig(extension)
      return keys.map((k) => store[k]) as WithUndefined<T>
    },
    async setConfigs(datas: Record<string, unknown>) {
      await updateExtensionSettings(extension.id, datas)
    },
  }
}
