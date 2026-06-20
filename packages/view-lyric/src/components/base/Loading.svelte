<script lang="ts">
  import { t } from '@/plugins/i18n'
  import { fade } from 'svelte/transition'
  import Btn from './Btn.svelte'
  import SvgIcon from './SvgIcon.svelte'

  let {
    loading,
    error,
    errorMessage,
    onreload,
  }: {
    loading: boolean
    error: boolean
    errorMessage?: string
    onreload?: () => void
  } = $props()
</script>

{#if loading}
  <div class="loading" in:fade={{ delay: 800, duration: 200 }} out:fade={{ duration: 200 }}>
    <p class="content">{$t('list_loading')}</p>
  </div>
{/if}
{#if error}
  <div class="error" transition:fade={{ duration: 200 }}>
    <div class="content">
      <p>{errorMessage ? $t('list_error_message', { msg: errorMessage }) : $t('list_error')}</p>
      <p>
        {#if onreload}
          <Btn
            icontext
            onclick={() => {
              onreload?.()
            }}
          >
            <SvgIcon name="refresh" />
            {$t('list_reload')}
          </Btn>
        {/if}
      </p>
    </div>
  </div>
{/if}

<style lang="less">
  .loading,
  .error {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 18px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      background-color: var(--color-content-background);
      opacity: 0.7;
    }
  }
  .content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
</style>
