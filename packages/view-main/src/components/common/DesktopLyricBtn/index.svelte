<script lang="ts">
  import Desktop from './Desktop.svelte'
  // import Web from './Web.svelte'
</script>

{#if import.meta.env.VITE_IS_DESKTOP}
  <Desktop />
{/if}
<!-- {#if import.meta.env.VITE_IS_WEB}
  <Web />
{/if} -->
