<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { t } from '@/plugins/i18n'
  let {
    local,
    disabled,
    musiccount,
    multimode,
    finding,
    onplay,
    onplayrandom,
    onmulti,
    onfind,
    onduplicate,
    onsort,
  }: {
    local: boolean
    disabled: boolean
    musiccount: number
    multimode: boolean
    finding: boolean
    onplay: () => void
    onplayrandom: () => void
    onmulti: () => void
    onfind: () => void
    onduplicate: () => void
    onsort: () => void
  } = $props()
</script>

<div class="header">
  <!-- <div class="info">
    <h3 class="title">{listinfo.name}</h3>
  </div>
  <div class="control-btns"> -->
  <div class="btns">
    <Btn min disabled={!musiccount || disabled} icontext onclick={onplay}>
      <SvgIcon name="play" />
      {$t('play_all')}
    </Btn>
    <Btn min disabled={!musiccount || disabled} icontext onclick={onplayrandom}>
      <SvgIcon name="list-random" />
      {$t('play_random')}
    </Btn>
  </div>
  <div class="btns">
    <Btn min outline={!multimode} icon onclick={onmulti} aria-label={multimode ? $t('batch_select_exit') : $t('batch_select')}>
      <SvgIcon name="multiple" />
    </Btn>
    <Btn min outline={!finding} icon onclick={onfind} aria-label={finding ? $t('find_music_exit') : $t('find_music')}>
      <SvgIcon name="search" />
    </Btn>
    {#if local}
      <Btn min disabled={!musiccount} outline icon onclick={onduplicate} aria-label={$t('duplicate_music')}>
        <SvgIcon name="duplicate" />
      </Btn>
      <Btn min disabled={!musiccount} outline icon onclick={onsort} aria-label={$t('sort_music')}>
        <SvgIcon name="sort" />
      </Btn>
    {/if}
  </div>
  <!-- </div> -->
</div>

<style lang="less">
  .header {
    flex: none;
    // height: 46px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    // align-items: center;
    padding: 0 15px 0 10px;
  }

  // .title {
  //   font-size: 24px;
  // }

  // .control-btns {
  //   display: flex;
  //   // gap: 10px;
  //   flex-flow: row wrap;
  //   display: flex;
  //   flex-direction: row;
  //   justify-content: space-between;
  //   align-items: center;
  //   gap: 10px;
  //   // :global(.btn) {
  //   //   margin-right: 10px;
  //   // }
  // }
  .btns {
    flex: none;
    display: flex;
    flex-flow: row nowrap;
    gap: 10px;
  }
</style>
