// import { hostCallActions } from '@/host/hostActions'
import { hostContext } from '@/host/state'

const contexts = new Map<string, (message: unknown) => void>()

export const createIsolateContext: AnyListen_API.API['utils']['createIsolateContext'] = async (
  onMessage
): Promise<AnyListen_API.IsolateContext> => {
  const id = await hostContext.hostFuncs.createIsolateContext()
  contexts.set(id, onMessage)

  return {
    sendMessage: async (message) => {
      if (!contexts.has(id)) throw new Error('Isolate context is destroyed')
      await hostContext.hostFuncs.sendMessageToIsolateContext(id, JSON.stringify(message))
    },
    run: async (code) => {
      if (!contexts.has(id)) throw new Error('Isolate context is destroyed')
      await hostContext.hostFuncs.runInIsolateContext(id, code)
    },
    runFile: async (filePath) => {
      if (!contexts.has(id)) throw new Error('Isolate context is destroyed')
      await hostContext.hostFuncs.runFileInIsolateContext(id, filePath)
    },
    destroy: async () => {
      if (!contexts.has(id)) throw new Error('Isolate context is destroyed')
      contexts.delete(id)
      await hostContext.hostFuncs.destroyIsolateContext(id)
    },
  }
}

export const onIsolateContextMessage = (contextId: string, message: string) => {
  const onMessage = contexts.get(contextId)
  if (!onMessage) return
  const parsedMessage = JSON.parse(message)
  onMessage(parsedMessage)
}
