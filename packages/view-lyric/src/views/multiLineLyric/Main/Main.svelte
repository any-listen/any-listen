<script lang="ts">
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import LyricHorizontal from './LyricHorizontal/LyricHorizontal.svelte'
  import LyricVertical from './LyricVertical/LyricVertical.svelte'

  let direction = useSettingValue('desktopLyric.multiLine.direction')
</script>

<main class="main">
  {#if direction.val === 'horizontal'}
    <LyricHorizontal />
  {:else}
    <LyricVertical />
  {/if}
</main>

<style lang="less">
  .main {
    flex: auto;
    min-height: 0;
  }
</style>
