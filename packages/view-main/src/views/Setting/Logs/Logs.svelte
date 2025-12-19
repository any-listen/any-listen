<script lang="ts">
  import { getExtensionLastLogs, clearExtensionLogs } from '@/shared/ipc/extension'
  import { onMount, type ComponentExports } from 'svelte'
  import type { LogItem } from './shared'
  import { extT } from '@/modules/extension/i18n'
  import { extensionEvent } from '@/modules/extension/store/event'
  import { logFormat } from '@any-listen/common/tools'
  import Header from './Header.svelte'
  import type TContent from './Content.svelte'

  let logs = $state.raw<LogItem[]>([])
  let avtiveLog = $state({ id: '', log: '' })
  let isBottom = $state(true)
  let cmpContent = $state<ComponentExports<typeof TContent>>()

  onMount(() => {
    let isUnmount = false
    void getExtensionLastLogs().then((_logs) => {
      if (isUnmount) return
      const list: LogItem[] = _logs.map((log) => {
        return {
          id: log.id,
          log: log.logs,
          name: $extT(log.id, log.name),
        }
      })
      if (list.length) {
        avtiveLog.id = list[0].id
        avtiveLog.log = list[0].log
        cmpContent?.toBottom(false)
      }
      logs = list
    })

    let unsub = extensionEvent.on('logOutput', (log) => {
      const logItem = logs.find((item) => item.id === log.id)
      if (logItem) {
        let message = `${logItem.log + logFormat(log)}\n`
        const arrMessage = message.split('\n')
        if (arrMessage.length > 500) {
          message = arrMessage.slice(-500).join('\n')
        }

        logItem.log = message
        if (avtiveLog.id === log.id) {
          avtiveLog.log = message
          if (isBottom) cmpContent?.toBottom()
        }
      } else {
        logs = [
          ...logs,
          {
            id: log.id,
            log: log.message,
            name: $extT(log.id, log.name),
          },
        ]
        if (!avtiveLog.id) {
          avtiveLog.id = log.id
          avtiveLog.log = log.message
          if (isBottom) cmpContent?.toBottom()
        }
      }
    })

    return () => {
      unsub()
      isUnmount = true
    }
  })
</script>

<div class="log-container">
  <Header
    {logs}
    {avtiveLog}
    onchange={(log) => {
      avtiveLog.id = log.id
      avtiveLog.log = log.log
      cmpContent?.toBottom(false)
    }}
    onclear={() => {
      clearExtensionLogs().then(() => {
        const logItem = logs.find((item) => item.id === avtiveLog.id)
        if (logItem) logItem.log = ''
        avtiveLog.log = ''
      })
    }}
  />
  {#await import('./Content.svelte') then { default: Content }}
    <Content bind:this={cmpContent} bind:isBottom log={avtiveLog.log} />
  {/await}
</div>

<style lang="less">
  .log-container {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-width: 0;
    margin: 10px;
    overflow: hidden;
    // padding-left: 10px;
  }
</style>
