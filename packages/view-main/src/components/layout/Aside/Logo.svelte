<script lang="ts">
  import { windowDarg } from '@/shared/browser/widnow'
</script>

{#if import.meta.env.VITE_IS_DESKTOP}
  <div class="aside-logo">Any Listen</div>
{/if}
{#if import.meta.env.VITE_IS_WEB}
  <div class="aside-logo" use:windowDarg>Any Listen</div>
{/if}

<style lang="less">
  .aside-logo {
    padding: 20px 20px 0;
    font-size: 20px;
    color: var(--color-primary-dark-300-alpha-100);
    -webkit-app-region: drag;
    // font-weight: bold;
  }
</style>
