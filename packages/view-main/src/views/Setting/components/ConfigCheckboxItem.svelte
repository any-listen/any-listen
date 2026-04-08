<script lang="ts">
  import Checkbox from '@/components/base/Checkbox.svelte'
  import TitleContent from './TitleContent.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import { executeCommand } from '@/shared/ipc/extension'
  import { t } from '@/plugins/i18n'
  let {
    item,
    onchange,
    onremove,
  }: {
    item: AnyListen.Extension.FormConfigValue<
      AnyListen.Extension.FormConfigCheckbox | AnyListen.Extension.FormConfigCheckboxMultiple
    >
    multiple?: boolean
    onchange: (value: string, checked: boolean) => void
    onremove: (value: string) => Promise<void>
  } = $props()
  // let id = $derived(`${name}_${desc}_${f}`)
  // console.log(item)
  let disabled = $derived(
    item.type == 'configCheckboxMultiple' && item.max != null && item.value != null && item.value.length >= item.max
  )
</script>

{#snippet CheckBoxItem(
  checkboxItem: AnyListen.Extension.ConfigEnum,
  removeable: boolean,
  checked: boolean,
  onchange: (checked: boolean) => void
)}
  <div class="settings-item-config-checkbox-item">
    <div class="settings-item-config-checkbox-item-content">
      <Checkbox
        label={checkboxItem.name}
        id={`extenstion_${item.type}_${item.field}_${checkboxItem.value}`}
        {checked}
        {onchange}
        disabled={!checked && disabled}
      />
      {#if removeable}
        <Btn
          min
          onclick={async () => {
            await onremove(checkboxItem.value)
          }}
        >
          {$t('btn_remove')}
        </Btn>
      {/if}
    </div>
    {#if checkboxItem.description}
      <p class="settings-item-desc">{checkboxItem.description}</p>
    {/if}
  </div>
{/snippet}

<TitleContent name={item.name} desc={item.description}>
  <div class="settings-item-config-checkbox">
    {#each item.enum as enumItem}
      {@render CheckBoxItem(enumItem, item.removeable ?? false, item.value?.includes(enumItem.value) ?? false, (checked) => {
        onchange(enumItem.value, checked)
      })}
    {/each}
    {#if item.actionCommands}
      <div class="settings-item-config-checkbox-action">
        {#each item.actionCommands as cmd, idx}
          <Btn
            min
            onclick={async () => {
              await executeCommand(cmd)
            }}>{item.actionCommandNames?.[idx] ?? cmd}</Btn
          >
        {/each}
      </div>
    {/if}
  </div>
</TitleContent>

<style lang="less">
  .settings-item-config-checkbox {
    margin-left: 16px;
    :global {
      .checkbox {
        margin-bottom: 5px;
        font-size: 14px;
      }
    }
  }
  .settings-item-desc {
    margin-top: -3px;
    margin-bottom: 6px;
    font-size: 12px;
    opacity: 0.7;
  }
  .settings-item-config-checkbox-action {
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
    margin-top: 8px;
  }
  .settings-item-config-checkbox-item {
    display: flex;
    flex-flow: column nowrap;

    .settings-item-config-checkbox-item-content {
      display: flex;
      flex-flow: row nowrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 3px;

      :global(.checkbox) {
        margin-bottom: 0;
      }
    }

    :global(.btn) {
      flex: none;
    }
  }
</style>
