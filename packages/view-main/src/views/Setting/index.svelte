<script lang="ts">
  import Header from './Header.svelte'
  import { query } from '@/plugins/routes'
  import { viewTypes } from './shared'
  import AppSetting from './AppSetting/AppSetting.svelte'
  import ExtensionSetting from './ExtensionSetting/ExtensionSetting.svelte'
  import Logs from './Logs/Logs.svelte'

  const activeView = $derived<(typeof viewTypes)[number]>(viewTypes.find((t) => t == $query.type) ?? 'app')
</script>

<div class="view-container container">
  <Header activeview={activeView} />
  {#if activeView == 'app'}
    <AppSetting />
  {:else if activeView == 'extension'}
    <ExtensionSetting />
  {:else if activeView == 'logs'}
    <Logs />
  {/if}
</div>

<style lang="less">
  .container {
    // padding: 10px 15px;
    display: flex;
    flex-flow: column nowrap;
    font-size: 14px;

    :global {
      .settings-item {
        padding-right: 10px;
        + .settings-item {
          .settings-item-title-container {
            margin-top: 14px;
          }
        }
      }
      .settings-item-content {
        margin-left: 16px;
      }
      .settings-title {
        padding: 3px 7px;
        margin-top: 6px;
        margin-bottom: 15px;
        font-size: 15px;
        border-left: 5px solid var(--color-primary-alpha-700);
      }

      .p {
        padding: 3px 0;
        line-height: 1.3;
        .btn {
          + .btn {
            margin-left: 10px;
          }
        }
      }
    }
  }
</style>
