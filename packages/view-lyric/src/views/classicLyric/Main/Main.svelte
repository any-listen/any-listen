<script lang="ts">
  import Lyric from './Lyric.svelte'
  import darg from '@/shared/compositions/drag.svelte'
</script>

<main class="main" {@attach darg}>
  <Lyric />
</main>

<style lang="less">
  .main {
    flex: auto;
    min-height: 0;
  }
</style>
