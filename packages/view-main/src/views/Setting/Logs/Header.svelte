<script lang="ts">
  // import Btn from '@/components/base/Btn.svelte'
  import Selection from '@/components/base/Selection.svelte'
  // import SvgIcon from '@/components/base/SvgIcon.svelte'
  import type { LogItem } from './shared'

  let {
    logs,
    avtiveLog,
    onchange,
  }: {
    logs: LogItem[]
    avtiveLog: { id: string; log: string }
    onchange: (log: LogItem) => void
  } = $props()

  let logsFormat = $derived(logs.map((log) => ({ ...log, name: `${log.name} (${log.id})` })))
</script>

<div class="log-header">
  <div class="log-header-title">Logs</div>
  <div class="log-header-action">
    {#if logs.length}
      <Selection
        value={avtiveLog.id}
        list={logsFormat}
        itemkey="id"
        itemname="name"
        onchange={(id) => {
          onchange(logs.find((log) => log.id === id)!)
        }}
      />
    {/if}
    <!-- <Btn icontext>
      <SvgIcon name="clear" />
    </Btn> -->
  </div>
</div>

<style lang="less">
  .log-header {
    flex: none;
    min-width: 0;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 10px 2px;
  }
  .log-header-title {
    flex: auto;
  }
  .log-header-action {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 6px;
  }
</style>
