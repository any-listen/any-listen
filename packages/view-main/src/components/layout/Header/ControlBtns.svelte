<script lang="ts">
  import ControlBtnsDesktop from './ControlBtnsDesktop.svelte'
  import ControlBtnsWeb from './ControlBtnsWeb.svelte'
</script>

{#if import.meta.env.VITE_IS_DESKTOP}
  <ControlBtnsDesktop />
{/if}
{#if import.meta.env.VITE_IS_WEB}
  <ControlBtnsWeb />
{/if}
