import fs from 'node:fs'
import vm from 'node:vm'
import { extensionEvent } from '../event'
import { extensionState } from '../state'
import { createContext } from './hostContext'
import type { VMState } from './hostContext/state'

// const createVM = () => {
//   vm.createContext()
// }

// const initContextEnv = async(preloadScript: string, extension: Extension) => {
//   const vmContext = createContext()
//   vm.runInContext(preloadScript, vmContext, {
//     filename: 'preload.js',
//   })

//   const key = randomUUID()
//   vm.runInContext(`globalThis.env_setup(${key}, ${JSON.stringify(extension)})`, vmContext, {
//     filename: 'setup.js',
//   })
//   return {
//     key,
//     vmContext,
//   }
// }

export interface Env {
  clientType: AnyListen.ClientType
  platform: NodeJS.Platform
  arch: NodeJS.Architecture
  locale: AnyListen.Locale
  i18nMessages: Record<string, string>
  version: string
}

export const createVmConetxt = async (extension: AnyListen.Extension.Extension, preloadScript: string) => {
  const vmState = await createContext(extension)
  vm.runInContext(preloadScript, vmState.vmContext, {
    filename: 'preload.js',
  })
  return vmState
}

export const setupVmContext = async (vmState: VMState) => {
  vm.runInContext(
    `globalThis.env_setup('${vmState.key}', ${JSON.stringify({
      id: vmState.extension.id,
      name: vmState.extension.name,
      description: vmState.extension.description,
      version: vmState.extension.version,
      author: vmState.extension.author,
      homepage: vmState.extension.homepage,
      grant: vmState.extension.grant,
      publicKey: vmState.extension.publicKey,
    } satisfies AnyListen.ExtensionVM.Extension)}, ${JSON.stringify({
      clientType: extensionState.clientType,
      platform: process.platform,
      arch: process.arch,
      locale: extensionState.locale,
      version: extensionState.varsion,
      i18nMessages: vmState.extension.i18nMessages,
    } satisfies Env)})`,
    vmState.vmContext,
    {
      filename: 'env-setup.js',
    }
  )

  for (const grant of vmState.extension.grant) {
    switch (grant) {
      case 'music_list':
        vmState.unsubscribeEvents.push(
          extensionEvent.on('musicListAction', (action: AnyListen.IPCList.ActionList) => {
            void vmState.preloadFuncs.musicListAction(JSON.parse(JSON.stringify(action)) as AnyListen.IPCList.ActionList)
          })
        )
        break
      case 'player':
        vmState.unsubscribeEvents.push(
          extensionEvent.on('playerEvent', (event: AnyListen.IPCPlayer.PlayerEvent) => {
            void vmState.preloadFuncs.playerEvent(JSON.parse(JSON.stringify(event)) as AnyListen.IPCPlayer.PlayerEvent)
          })
        )
        vmState.unsubscribeEvents.push(
          extensionEvent.on('playListAction', (action: AnyListen.IPCPlayer.PlayListAction) => {
            void vmState.preloadFuncs.playListAction(JSON.parse(JSON.stringify(action)) as AnyListen.IPCPlayer.PlayListAction)
          })
        )
        vmState.unsubscribeEvents.push(
          extensionEvent.on('playHistoryListAction', (action: AnyListen.IPCPlayer.PlayHistoryListAction) => {
            void vmState.preloadFuncs.playHistoryListAction(
              JSON.parse(JSON.stringify(action)) as AnyListen.IPCPlayer.PlayHistoryListAction
            )
          })
        )
        break
      default:
        break
    }
  }
}

export const runExtension = async (vmContext: AnyListen.ExtensionVM.VMContext, extension: AnyListen.Extension.Extension) => {
  const code = (await fs.promises.readFile(extension.enter, 'utf-8')).toString()
  const runStartTime = performance.now()
  vm.runInContext(code, vmContext, {
    breakOnSigint: true,
    filename: extension.enter,
    timeout: 10_000,
  })
  return Math.round(performance.now() - runStartTime)
}
// export const runExtension = async(preloadScript: string, extension: AnyListen.Extension.Extension) => {
//   const vmInfo = await initContextEnv(preloadScript, extension)

//   const code = (await fs.promises.readFile(extension.enter, 'utf-8')).toString()
//   const runStartDate = performance.now()
//   vm.runInContext(code, vmInfo.vmContext, {
//     breakOnSigint: true,
//     filename: extension.name,
//     timeout: 10_000,
//   })
//   const runTotalTime = performance.now() - runStartDate
//   return {
//     ...vmInfo,
//     runTotalTime,
//   }
// }

export { destroyContext } from './hostContext'
export { resourceAction, updateI18nMessage, updateLocale } from './hostContext/preloadFuncs'
