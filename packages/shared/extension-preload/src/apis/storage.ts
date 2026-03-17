import { hostContext } from '@/host/state'

export const storage = {
  async saveFile(path: string, content: string | Uint8Array) {
    if (typeof path != 'string') throw new Error('path required a string')
    if (typeof content != 'string' && !(content instanceof Uint8Array)) {
      throw new Error('content required a string or Uint8Array')
    }
    await hostContext.hostFuncs.saveFile(path, content)
  },
  async readFile(path: string) {
    if (typeof path != 'string') throw new Error('path required a string')
    return hostContext.hostFuncs.readFile(path)
  },
  async removeFile(path: string) {
    if (typeof path != 'string') throw new Error('path required a string')
    await hostContext.hostFuncs.removeFile(path)
  },
  async fileExists(path: string) {
    if (typeof path != 'string') throw new Error('path required a string')
    return hostContext.hostFuncs.fileExists(path)
  },
  async listFiles(path = '') {
    if (typeof path != 'string') throw new Error('path required a string')
    return hostContext.hostFuncs.listFiles(path)
  },
  async statFile(path: string) {
    if (typeof path != 'string') throw new Error('path required a string')
    return hostContext.hostFuncs.statFile(path)
  },
}
