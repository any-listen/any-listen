import { onMount, untrack, type ComponentExports } from 'svelte'

import { i18n } from '@/plugins/i18n'
import { clearAppLog, getAppLogs } from '@/shared/ipc/app'
import { appLogEvent } from '@/shared/ipc/app/event'

import type TContent from './Content.svelte'
import type { LogType } from './shared'

export const useAppLog = (data: {
  activeLogType: LogType
  avtiveLog: string
  activeLogContent: string
  cmpContent?: ComponentExports<typeof TContent>
  isBottom: boolean
}) => {
  let isUnmount = false
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const appLogs = new Map<AnyListen.LogType, string>()
  const appTypes: AnyListen.LogType[] = ['App', 'ExtensionService', 'WebdavSync']
  let appLogTabs = $derived(appTypes.map((type) => ({ name: i18n.t(`logs.type_${type}`), value: type })))

  $effect(() => {
    if (data.activeLogType !== 'app') return
    untrack(() => {
      data.avtiveLog = 'App'
      data.activeLogContent = appLogs.get('App') ?? ''
    })
  })

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    data.avtiveLog
    untrack(() => {
      if (data.activeLogType !== 'app') return
      const type = data.avtiveLog as AnyListen.LogType
      if (appLogs.has(type)) {
        requestAnimationFrame(() => {
          data.activeLogContent = appLogs.get(type) ?? ''
          data.cmpContent?.toBottom(false)
        })
      } else {
        void getAppLogs(type).then((_logs) => {
          if (isUnmount) return
          // let message = appLogs.get(type) ?? ''
          // if (message) {
          //   message = `${message}\n${_logs}\n`
          // } else {
          //   message = `${_logs}\n`
          // }
          // const arrMessage = message.split('\n')
          // if (arrMessage.length > 500) {
          //   message = arrMessage.slice(-500).join('\n')
          // }
          appLogs.set(type, _logs)
          if (data.activeLogType === 'app' && data.avtiveLog === type) {
            data.activeLogContent = _logs
            data.cmpContent?.toBottom(false)
          }
        })
      }
    })
  })
  onMount(() => {
    isUnmount = false
    let unsub = appLogEvent.on((type, log) => {
      let message = appLogs.get(type) ?? ''
      if (message) {
        message = `${message}${log}\n`
      } else {
        message = `${log}\n`
      }
      const arrMessage = message.split('\n')
      if (arrMessage.length > 500) {
        message = arrMessage.slice(-500).join('\n')
      }
      appLogs.set(type, message)
      if (data.activeLogType === 'app' && data.avtiveLog === type) {
        data.activeLogContent = message
        if (data.isBottom) data.cmpContent?.toBottom()
      }
    })

    return () => {
      unsub()
      isUnmount = true
    }
  })

  return {
    get appLogTabs() {
      return appLogTabs
    },
    clearAppLog: async (type: AnyListen.LogType) => {
      appLogs.set(type, '')
      if (data.activeLogType === 'app' && data.avtiveLog === type) data.activeLogContent = ''
      void clearAppLog(type)
    },
  }
}
