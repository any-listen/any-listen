// import { hostCallActions } from '@/host/hostActions'
import type { AbortSignal } from '@/event/AbortController'
import { hostContext } from '@/host/state'
import { generateId } from '@/utils'

// export const init = () => {
//   hostCallActions('init', '')
// }

// export const showUpdateAlert = () => {
//   hostCallActions('show_update_alert', '')
// }

// export const app: AnyListen_API.App = {
const keys = new Set<string>()
const buildKey = async <T>(run: (key: string) => Promise<T>, signal?: AbortSignal) => {
  const key = generateId()
  keys.add(key)
  if (signal) {
    signal.on('abort', () => {
      if (!keys.has(key)) return
      void hostContext.hostFuncs.closeMessageBox(key)
    })
  }
  return run(key).finally(() => {
    keys.delete(key)
  })
}

// TODO verify options
export const app: AnyListen_API.App = {
  async showMessage(message, { signal, ...options } = {}) {
    return buildKey(
      async (key) => {
        return hostContext.hostFuncs.showMessageBox(key, { ...options, detail: message })
      },
      signal as AbortSignal | undefined
    )
  },
  async showInputDialog({ signal, validateInput, ...options }) {
    return buildKey(
      async (key) => {
        return hostContext.hostFuncs.showInputBox(key, {
          ...options,
          validateInput: validateInput
            ? async (value: string) => {
                let val = await validateInput(value)
                if (typeof val === 'string' && val.length > 1024) {
                  val = `${val.substring(0, 1021)}...`
                }
                return val
              }
            : undefined,
        })
      },
      signal as AbortSignal | undefined
    )
  },
  async showOpenDialog(options) {
    return buildKey(async (key) => hostContext.hostFuncs.showOpenBox(key, options))
  },
  async showSaveDialog(options) {
    return buildKey(async (key) => hostContext.hostFuncs.showSaveBox(key, options))
  },
  async readOpenDialogFile(path, format) {
    return hostContext.hostFuncs.readOpenBoxFile(path, format)
  },
  async writeSaveDialogFile(dir, name, content) {
    return hostContext.hostFuncs.writeSaveBoxFile(dir, name, content)
  },
  // async getConnectedClient() {
  //   return hostContext.hostFuncs.getConnectedClients()
  // },
}
