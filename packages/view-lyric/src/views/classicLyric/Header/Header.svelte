<script lang="ts">
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import ControlBtns from './ControlBtns.svelte'
  import { fade } from 'svelte/transition'
  const lock = useSettingValue('desktopLyric.isLock')
</script>

{#if !lock.val}
  <header class="header" transition:fade>
    <ControlBtns />
  </header>
{/if}

<style lang="less" module>
  .header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    justify-content: flex-end;
    background-color: rgb(0 0 0 / 70%);
    border-bottom-left-radius: @radius-border;
  }
</style>
