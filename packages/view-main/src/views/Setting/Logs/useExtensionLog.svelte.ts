import { logFormat } from '@any-listen/common/tools'
import { onMount, untrack, type ComponentExports } from 'svelte'

import { extI18n } from '@/modules/extension/i18n'
import { extensionEvent } from '@/modules/extension/store/event'
import { clearExtensionLogs, getExtensionLastLogs } from '@/shared/ipc/extension'

import type TContent from './Content.svelte'
import type { LogItem, LogType } from './shared'

export const useExtensionLog = (data: {
  activeLogType: LogType
  avtiveLog: string
  activeLogContent: string
  cmpContent?: ComponentExports<typeof TContent>
  isBottom: boolean
}) => {
  let initedExtensionLogs = false
  let isUnmount = false
  let extensionLogItems = $state.raw<LogItem[]>([])
  let logsFormat = $derived(extensionLogItems.map((log) => ({ name: `${log.name} (${log.id})`, value: log.id })))

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    data.avtiveLog
    untrack(() => {
      if (data.activeLogType !== 'extension') return
      requestAnimationFrame(() => {
        const logItem = extensionLogItems.find((item) => item.id === data.avtiveLog)
        data.activeLogContent = logItem?.log ?? ''
        data.cmpContent?.toBottom(false)
      })
    })
  })
  $effect(() => {
    if (data.activeLogType !== 'extension') return
    untrack(() => {
      if (extensionLogItems.length) data.avtiveLog = extensionLogItems[0].id
    })
  })
  $effect(() => {
    if (data.activeLogType !== 'extension' || initedExtensionLogs) {
      return
    }
    untrack(() => {
      initedExtensionLogs = true
      void getExtensionLastLogs().then((_logs) => {
        if (isUnmount) return
        const list: LogItem[] = _logs.map((log) => {
          return {
            id: log.id,
            log: log.logs,
            name: extI18n.t(log.id, log.name),
          }
        })
        extensionLogItems = list
        if (list.length && data.activeLogType === 'extension') data.avtiveLog = list[0].id
      })
    })
  })
  onMount(() => {
    isUnmount = false
    let unsub = extensionEvent.on('logOutput', (log) => {
      const logItem = extensionLogItems.find((item) => item.id === log.id)
      if (logItem) {
        let message = `${logItem.log + logFormat(log)}\n`
        const arrMessage = message.split('\n')
        if (arrMessage.length > 500) {
          message = arrMessage.slice(-500).join('\n')
        }

        logItem.log = message
        if (data.avtiveLog === log.id) {
          data.activeLogContent = message
          if (data.isBottom) data.cmpContent?.toBottom()
        }
      } else {
        extensionLogItems = [
          ...extensionLogItems,
          {
            id: log.id,
            log: log.message,
            name: extI18n.t(log.id, log.name),
          },
        ]
        if (data.activeLogType === 'extension' && !data.avtiveLog) data.avtiveLog = log.id
      }
    })

    return () => {
      unsub()
      isUnmount = true
    }
  })

  return {
    get extensionLogTabs() {
      return logsFormat
    },
    clearExtensionLog: async (id: string) => {
      const logItem = extensionLogItems.find((item) => item.id === id)
      if (logItem) logItem.log = ''
      if (data.activeLogType === 'extension' && data.avtiveLog === id) data.activeLogContent = ''
      void clearExtensionLogs(id)
    },
  }
}
