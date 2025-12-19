<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import Selection from '@/components/base/Selection.svelte'
  // import SvgIcon from '@/components/base/SvgIcon.svelte'
  import type { LogItem } from './shared'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { t } from '@/plugins/i18n'

  let {
    logs,
    avtiveLog,
    onchange,
    onclear,
  }: {
    logs: LogItem[]
    avtiveLog: { id: string; log: string }
    onchange: (log: LogItem) => void
    onclear: () => void
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
      <Btn icon onclick={onclear} aria-label={$t('logs.btn_clear')}><SvgIcon name="erase" /></Btn>
    {/if}
    <!-- <Btn icontext>
      <SvgIcon name="clear" />
    </Btn> -->
  </div>
</div>

<style lang="less">
  .log-header {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    align-items: center;
    min-width: 0;
    padding: 10px 2px;

    :global(.btn) {
      width: 28px;
      height: 28px;
    }
  }
  .log-header-title {
    flex: auto;
  }
  .log-header-action {
    display: flex;
    flex-flow: row nowrap;
    gap: 6px;
    align-items: center;
  }
</style>
