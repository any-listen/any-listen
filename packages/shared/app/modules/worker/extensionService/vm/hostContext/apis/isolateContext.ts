import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

import { EXTENSION } from '@any-listen/common/constants'
import { generateId } from '@any-listen/common/utils'
import { joinPath, normalizePath } from '@any-listen/nodejs'

import { sendIsolateContextMessage } from '../preloadFuncs'
import { contextState } from '../state'

const handleCreateIsolateFuncs = (extension: AnyListen.Extension.Extension) => {
  const MAX_ISOLATE_CONTEXTS = 5

  const timeouts = new Map<string, Map<string, ['timeout' | 'interval', NodeJS.Timeout]>>()
  const DIR_PREFIXES = [EXTENSION.storageDirPrefix, EXTENSION.extensionDirPrefix] as const
  const isolateContexts = new Map<
    string,
    {
      context: vm.Context
      contextObj: {
        onmessage: (message: string) => void
        tiggerTimeout: (id: string, type: 'timeout' | 'interval') => void
      }
    }
  >()
  const getIsolateContextInfo = (contextId: string) => {
    const contextInfo = isolateContexts.get(contextId)
    if (!contextInfo) {
      throw new Error(`Isolate context with id ${contextId} not found for extension ${extension.id}`)
    }
    return contextInfo
  }
  let isListeningDestroyedEvent = false
  const clearContextTimeouts = (contextId: string) => {
    const contextTimeouts = timeouts.get(contextId)
    if (!contextTimeouts) return
    contextTimeouts.forEach((timeout) => {
      switch (timeout[0]) {
        case 'timeout':
          clearTimeout(timeout[1])
          break
        case 'interval':
          clearInterval(timeout[1])
          break
      }
    })
    contextTimeouts.clear()
  }
  const onExtensionDestroyed = () => {
    const contexts = isolateContexts.get(extension.id)
    if (contexts) isolateContexts.clear()
    if (timeouts.size) {
      for (const id of timeouts.keys()) clearContextTimeouts(id)
      timeouts.clear()
    }
  }
  const listenDestroyedEvent = () => {
    if (isListeningDestroyedEvent) return
    isListeningDestroyedEvent = true
    const vmState = contextState.vmContexts.get(extension.id)
    if (!vmState) return
    vmState.unsubscribeEvents.push(onExtensionDestroyed)
  }
  return {
    async createIsolateContext() {
      if (isolateContexts.size >= MAX_ISOLATE_CONTEXTS) {
        throw new Error(`Maximum number of isolate contexts (${MAX_ISOLATE_CONTEXTS}) reached for extension ${extension.id}`)
      }
      listenDestroyedEvent()
      const id = generateId()
      const context = vm.createContext(
        {
          hostObj: {
            onmessage(message: string) {
              if (typeof message !== 'string') throw new Error('Illegal message type')
              sendIsolateContextMessage(extension.id, id, message)
            },
            runTimeout(id: string, type: 'timeout' | 'interval', delay: number) {
              if (delay < 0) delay = 0
              if (delay > 0x7fffffff) delay = 0x7fffffff
              let contextTimeouts = timeouts.get(id)
              if (!contextTimeouts) {
                contextTimeouts = new Map()
                timeouts.set(id, contextTimeouts)
              }
              if (contextTimeouts.size >= 1000) {
                throw new Error('Maximum number of timeouts (1000) reached')
              }
              let timeout: NodeJS.Timeout
              switch (type) {
                case 'timeout':
                  timeout = setTimeout(() => {
                    contextTimeouts.delete(id)
                    const contextInfo = isolateContexts.get(id)
                    if (!contextInfo) return
                    contextInfo.contextObj.tiggerTimeout(id, 'timeout')
                  }, delay)
                  contextTimeouts.set(id, ['timeout', timeout])
                  break
                case 'interval':
                  timeout = setInterval(() => {
                    const contextInfo = isolateContexts.get(id)
                    if (!contextInfo) return
                    contextInfo.contextObj.tiggerTimeout(id, 'interval')
                  }, delay)
                  contextTimeouts.set(id, ['interval', timeout])
                  break
              }
            },
            clearTimeout(id: string) {
              const contextTimeouts = timeouts.get(id)
              if (!contextTimeouts) return
              const timeout = contextTimeouts.get(id)
              if (!timeout) return
              switch (timeout[0]) {
                case 'timeout':
                  clearTimeout(timeout[1])
                  break
                case 'interval':
                  clearInterval(timeout[1])
                  break
              }
              contextTimeouts.delete(id)
            },
          },
        },
        {
          codeGeneration: {
            strings: false,
            wasm: false,
          },
          name: `isolate-${extension.id}.${id}.js`,
        }
      )
      vm.runInContext(
        `(() => {
          const hostObj = globalThis.hostObj
          delete globalThis.hostObj
          globalThis.postMessage = (message) => {
            hostObj.onmessage(JSON.stringify(message))
          }

          const listeners = []
          const MAX_LISTENERS = 20

          const timeouts = new Map()
          const contextObj = {
            onmessage: (message) => {
              message = JSON.parse(message)
              listeners.forEach((listener) => listener(message))
            },
            tiggerTimeout: (id, type) => {
              const timeout = timeouts.get(id)
              if (timeout) {
                if (type == 'timeout') timeouts.delete(id)
                timeout()
              }
            },
          }
          globalThis.contextObj = contextObj
          globalThis.onmessage = (listener) => {
            if (typeof listener !== 'function') {
              throw new TypeError('onmessage listener must be a function')
            }
            if (listeners.length >= MAX_LISTENERS) {
              throw new Error('Maximum number of onmessage listeners (' + MAX_LISTENERS + ') reached')
            }
            listeners.push(listener)
            return () => {
              const index = listeners.indexOf(listener)
              if (index !== -1) {
                listeners.splice(index, 1)
              }
            }
          }

          globalThis.setTimeout = (func, delay = 0) => {
            if (typeof func !== 'function') {
              throw new TypeError('setTimeout callback must be a function')
            }
            if (typeof delay !== 'number') {
              throw new TypeError('setTimeout delay must be a number')
            }
            const id = Math.random().toString(36).slice(2)
            timeouts.set(id, func)
            hostObj.runTimeout(id, 'timeout', delay)
          }
          globalThis.setInterval = (func, delay = 0) => {
            if (typeof func !== 'function') {
              throw new TypeError('setInterval callback must be a function')
            }
            if (typeof delay !== 'number') {
              throw new TypeError('setInterval delay must be a number')
            }
            const id = Math.random().toString(36).slice(2)
            timeouts.set(id, func)
            hostObj.runTimeout(id, 'interval', delay)
          }
          globalThis.clearTimeout = (id) => {
            if (typeof id !== 'string') {
              throw new TypeError('clearTimeout id must be a string')
            }
            if (!timeouts.has(id)) return
            timeouts.delete(id)
            hostObj.clearTimeout(id)
          }
          globalThis.clearInterval = globalThis.clearTimeout
        })()`,
        context
      )
      isolateContexts.set(id, { context, contextObj: context.contextObj })
      vm.runInContext('delete globalThis.contextObj', context)
      return id
    },
    async sendMessageToIsolateContext(contextId: string, message: string) {
      if (typeof message !== 'string') throw new Error('Illegal message type')
      const contextInfo = getIsolateContextInfo(contextId)
      contextInfo.contextObj.onmessage(message)
    },
    async runInIsolateContext(contextId: string, code: string) {
      const contextInfo = getIsolateContextInfo(contextId)
      vm.runInContext(code, contextInfo.context)
    },
    async runFileInIsolateContext(contextId: string, filePath: string) {
      const contextInfo = getIsolateContextInfo(contextId)
      const pathMap = {
        [EXTENSION.storageDirPrefix]: joinPath(extension.dataDirectory, EXTENSION.storageDirName),
        [EXTENSION.extensionDirPrefix]: extension.directory,
      } as const
      filePath = path.normalize(filePath)
      let baseDir = ''
      for (const prefix of DIR_PREFIXES) {
        if (filePath.startsWith(prefix + path.sep)) {
          baseDir = pathMap[prefix]
          filePath = joinPath(baseDir, filePath.slice(prefix.length + 1))
          break
        }
      }
      if (!baseDir) {
        baseDir = pathMap[EXTENSION.storageDirPrefix]
        filePath = joinPath(baseDir, filePath)
      }
      const fullPath = normalizePath(filePath)
      if (!fullPath.startsWith(baseDir + path.sep)) throw new Error('Invalid path')
      vm.runInContext(await fs.readFile(fullPath, 'utf-8'), contextInfo.context)
    },
    async destroyIsolateContext(contextId: string) {
      const contextInfo = isolateContexts.get(contextId)
      if (!contextInfo) {
        throw new Error(`Isolate context with id ${contextId} not found for extension ${extension.id}`)
      }
      isolateContexts.delete(contextId)
      clearContextTimeouts(contextId)
    },
  } as const
}

export const createIsolateFuncs = (extension: AnyListen.Extension.Extension) => {
  if (!extension.grant.includes('isolate_context')) {
    return {} as unknown as ReturnType<typeof handleCreateIsolateFuncs>
  }
  return handleCreateIsolateFuncs(extension)
}
