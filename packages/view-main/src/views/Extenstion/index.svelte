<script lang="ts">
  import Header from './Header.svelte'
  import { query } from '@/plugins/routes'
  import { viewTypes } from './shared'
  import InstalledList from './InstalledList.svelte'
  import OnlineList from './OnlineList.svelte'

  let activeView = $derived<(typeof viewTypes)[number]>(viewTypes.find((t) => t == $query.type) ?? 'installed')
</script>

<div class="view-container container">
  <Header activeview={activeView} />
  {#if activeView == 'online'}
    <OnlineList />
  {:else}
    <InstalledList type={activeView} />
  {/if}
</div>

<style lang="less">
  .container {
    // padding: 10px 15px;
    display: flex;
    flex-flow: column nowrap;
  }
</style>
