<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { t } from '@/plugins/i18n'

  let {
    name,
    description,
    keyText,
    error,
    onedit,
    onremove,
  }: {
    name?: string
    description?: string
    keyText: string
    error?: boolean
    onedit: () => void
    onremove: () => void
  } = $props()
</script>

<div class="item">
  <div class="command">
    {#if name}
      <p class="name" aria-label={description}>{name}</p>
    {:else}
      <p class="name error" aria-label={description}>{$t('settings.hotkey.not_exist')}</p>
    {/if}
    {#if error}
      <p class="status">{$t('settings.hotkey.registration_failed')}</p>
    {/if}
  </div>
  <kbd>{keyText}</kbd>
  <div class="right">
    <Btn aria-label={$t('settings.hotkey.edit')} middle icon onclick={onedit}>
      <SvgIcon name="edit" />
    </Btn>
    <Btn aria-label={$t('settings.hotkey.remove')} middle icon onclick={onremove}>
      <SvgIcon name="multiply" />
    </Btn>
  </div>
</div>

<style lang="less">
  .item {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
    max-width: 500px;
    background: var(--color-content-background);
    border-radius: @form-radius;
  }
  .command {
    display: flex;
    flex: auto;
    flex-direction: column;
    min-width: 0;
    .name {
      margin: 0;
      font-size: 13px;
      .mixin-ellipsis-1;
      &.error {
        color: var(--color-font-error);
      }
    }
  }
  .right {
    display: flex;
    flex: none;
    :global {
      .btn {
        padding: 6px;
        border-radius: 0;
        &:first-child {
          border-top-left-radius: @form-radius;
          border-bottom-left-radius: @form-radius;
        }
        &:last-child {
          border-top-right-radius: @form-radius;
          border-bottom-right-radius: @form-radius;
        }
      }
    }
  }
  kbd {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    min-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    white-space: nowrap;
    background: var(--color-button-background);
    border-top-left-radius: @form-radius;
    border-bottom-left-radius: @form-radius;
  }
  .status {
    margin: 0;
    font-size: 12px;
    color: var(--color-font-error);
  }
</style>
