<script lang="ts">
  import type { ComponentExports } from 'svelte'
  import type { LogType } from './shared'
  import Header from './Header.svelte'
  import type TContent from './Content.svelte'
  import { useAppLog } from './useAppLog.svelte'
  import { useExtensionLog } from './useExtensionLog.svelte'

  let activeLogType = $state<LogType>('app')
  let avtiveLog = $state('')
  let isBottom = $state(true)
  let activeLogContent = $state('')
  let cmpContent = $state<ComponentExports<typeof TContent>>()

  const appLog = useAppLog({
    get activeLogType() {
      return activeLogType
    },
    get avtiveLog() {
      return avtiveLog
    },
    set avtiveLog(value) {
      avtiveLog = value
    },
    get activeLogContent() {
      return activeLogContent
    },
    set activeLogContent(value) {
      activeLogContent = value
    },
    get isBottom() {
      return isBottom
    },
    get cmpContent() {
      return cmpContent
    },
  })
  const extensionLog = useExtensionLog({
    get activeLogType() {
      return activeLogType
    },
    get avtiveLog() {
      return avtiveLog
    },
    set avtiveLog(value) {
      avtiveLog = value
    },
    get activeLogContent() {
      return activeLogContent
    },
    set activeLogContent(value) {
      activeLogContent = value
    },
    get isBottom() {
      return isBottom
    },
    get cmpContent() {
      return cmpContent
    },
  })
</script>

<div class="log-container">
  <Header
    bind:activeLogType
    logs={activeLogType === 'app' ? appLog.appLogTabs : extensionLog.extensionLogTabs}
    {avtiveLog}
    onchange={(id) => {
      avtiveLog = id
    }}
    onclear={async () => {
      if (activeLogType === 'app') {
        await appLog.clearAppLog(avtiveLog as AnyListen.LogType)
      } else if (activeLogType === 'extension') {
        await extensionLog.clearExtensionLog(avtiveLog)
      }
    }}
  />
  {#await import('./Content.svelte') then { default: Content }}
    <Content bind:this={cmpContent} bind:isBottom log={activeLogContent} />
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
