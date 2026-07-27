<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import Selection from '@/components/base/Selection.svelte'
  // import SvgIcon from '@/components/base/SvgIcon.svelte'
  import type { LogType } from './shared'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { t } from '@/plugins/i18n'
  import Tab from '@/components/base/Tab.svelte'
  import { LogTypeTabs } from './shared'

  let {
    logs,
    activeLogType = $bindable(),
    avtiveLog,
    onchange,
    onclear,
  }: {
    logs: Array<{ value: string; name: string }>
    activeLogType: LogType
    avtiveLog: string
    onchange: (id: string) => void
    onclear: () => void
  } = $props()

  // t(`logs.app`)
  let logTypeTabs = $derived(LogTypeTabs.map((type) => ({ name: $t(`logs.${type}`), value: type })))
</script>

<div class="log-header">
  <div class="log-header-type">
    <Tab list={logTypeTabs} bind:value={activeLogType} itemkey="value" itemlabel="name"></Tab>
  </div>
  <div class="log-header-action">
    {#if logs.length}
      <Selection value={avtiveLog} list={logs} itemkey="value" itemname="name" {onchange} />
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
    justify-content: space-between;
    min-width: 0;
    padding: 0 2px 10px;

    :global(.btn) {
      width: 28px;
      height: 28px;
    }
  }
  // .log-header-type {
  // flex: auto;
  // }
  .log-header-action {
    display: flex;
    flex-flow: row nowrap;
    gap: 6px;
    align-items: center;
  }
</style>
