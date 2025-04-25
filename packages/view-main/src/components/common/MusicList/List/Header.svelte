<script lang="ts">
  import Checkbox from '@/components/base/Checkbox.svelte'
  import { t } from '@/plugins/i18n'
  let {
    multimode,
    picwidth,
    selectall,
    onselectall,
    disabledselect,
  }: {
    multimode: boolean
    selectall: boolean
    picwidth: number
    disabledselect?: boolean
    onselectall: (all: boolean) => void
  } = $props()
  // console.log(params)
</script>

<div class="header">
  <div class="num" style={`width:${picwidth}px;`}>
    {#if multimode}
      <Checkbox
        arialabel={$t('select_all')}
        checked={selectall}
        id="music_list_select_all_checkbox"
        disabled={disabledselect}
        onchange={() => {
          onselectall(!selectall)
        }}
      />
    {:else}
      #
    {/if}
  </div>
  <span style="flex: auto;">{$t('music_name')}</span>
  <span style="width: 22%;">{$t('music_singer')}</span>
  <span style="width: 22%;">{$t('music_album')}</span>
  <span style="width: 9%;">{$t('music_time')}</span>
</div>

<style lang="less">
  .header {
    flex: none;
    height: 36px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0 12px;
    gap: 10px;
    // border-bottom: 1px solid var(--color-border);
    font-size: 12px;
    color: var(--color-font-label);

    :global(.checkbox) {
      font-size: 14px;
    }
  }
  .num {
    .nobreak();
    .center();
    display: flex;
    align-items: center;
    justify-content: center;
    // color: var(--color-font-label);
  }
</style>
