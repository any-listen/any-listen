<script lang="ts">
  import InputItem from '../components/InputItem.svelte'
  import CheckboxItem from '../components/CheckboxItem.svelte'
  import RadioItem from '../components/RadioItem.svelte'
  import SelectionItem from '../components/SelectionItem.svelte'
  import type { EnumItem, SettingListCommonItem } from './settings'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import RadioGroup from '../components/RadioGroup.svelte'
  import { onMount } from 'svelte'
  import { t } from '@/plugins/i18n'

  let {
    item,
  }: {
    item: SettingListCommonItem
  } = $props()

  let list = $state.raw<EnumItem[]>([])

  onMount(() => {
    if (item.type == 'radio') {
      if (item.asyncEnum) {
        void item.asyncEnum().then((res) => {
          list = res
        })
      } else {
        list = item.enum!
      }
    }
  })

  let setting = useSettingValue(item.field)
</script>

{#if item.type === 'input'}
  <InputItem
    id={`extenstion_${item.field}_${item.type}`}
    name={$t(item.name)}
    desc={item.description && $t(item.description)}
    textarea={item.textarea}
    value={setting.val as string}
    onchange={(val) => {
      if (item.onUpdate) {
        item.onUpdate(val.trim())
      } else {
        void updateSetting({ [item.field]: val.trim() })
      }
      item.onChnaged?.(val.trim())
    }}
  />
{:else if item.type === 'boolean'}
  <CheckboxItem
    id={`extenstion_${item.field}_${item.type}`}
    name={$t(item.name)}
    desc={item.description && $t(item.description)}
    checked={setting.val as boolean}
    onchange={(val) => {
      if (item.onUpdate) {
        item.onUpdate(val)
      } else {
        void updateSetting({ [item.field]: val })
      }
      item.onChnaged?.(val)
    }}
  />
{:else if item.type === 'radio'}
  <RadioGroup name={$t(item.name)} desc={item.description && $t(item.description)}>
    {#each list as radioItem (radioItem.value)}
      <RadioItem
        id={`extenstion_${item.field}_${item.type}_${radioItem.value}`}
        name={$t(radioItem.name)}
        value={radioItem.value}
        checked={(setting.val as string) == radioItem.value}
        onselect={(val) => {
          if (item.onUpdate) {
            item.onUpdate(val)
          } else {
            void updateSetting({ [item.field]: val })
          }
          item.onChnaged?.(val)
        }}
      />
    {/each}
  </RadioGroup>
{:else if item.type === 'selection'}
  <SelectionItem
    name={$t(item.name)}
    desc={item.description && $t(item.description)}
    value={setting.val as string | number}
    list={item.enum.map((n) => ({ label: n.name, value: n.value }))}
    onchange={(val) => {
      if (item.onUpdate) {
        item.onUpdate(val)
      } else {
        void updateSetting({ [item.field]: val })
      }
      item.onChnaged?.(val)
    }}
  />
{/if}

<style lang="less">
  // .settings-item {
  //   padding-right: 10px;
  // }
</style>
