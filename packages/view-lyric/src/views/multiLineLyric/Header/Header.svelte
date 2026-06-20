<script lang="ts">
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import ControlBtns from './ControlBtns.svelte'
  import darg from '@/shared/compositions/drag.svelte'
  import { fade } from 'svelte/transition'
  const lock = useSettingValue('desktopLyric.isLock')
</script>

{#if !lock.val}
  <header class="header" transition:fade {@attach darg}>
    <ControlBtns />
  </header>
{/if}

<style lang="less" module>
  .header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    width: 100%;
    background-color: rgb(0 0 0 / 70%);
  }
</style>
