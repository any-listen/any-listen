<script>
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import ClassicLyric from '@/views/classicLyric/ClassicLyric.svelte'
  import MultiLineLyric from '@/views/multiLineLyric/MultiLineLyric.svelte'

  const mode = useSettingValue('desktopLyric.mode')
</script>

{#if mode.val === 'classic'}
  <ClassicLyric />
{:else if mode.val === 'multiLine'}
  <MultiLineLyric />
{/if}
