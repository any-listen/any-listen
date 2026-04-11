<script lang="ts">
  import InputItem from '../components/InputItem.svelte'
  import { updateExtensionSettings } from '@/shared/ipc/extension'
  import CheckboxItem from '../components/CheckboxItem.svelte'
  import SelectionItem from '../components/SelectionItem.svelte'
  import ConfigCheckboxItem from '../components/ConfigCheckboxItem.svelte'

  let {
    id,
    item,
  }: {
    id: string
    item: AnyListen.Extension.FormValueItem
  } = $props()
</script>

<div class="settings-item">
  {#if item.type === 'input'}
    <InputItem
      id={`extenstion_${item.field}_${item.type}`}
      name={item.name}
      desc={item.description}
      textarea={item.textarea}
      value={item.value ?? item.default ?? ''}
      onchange={(val) => {
        void updateExtensionSettings(id, { [item.field]: val.trim() })
      }}
    />
  {:else if item.type === 'boolean'}
    <CheckboxItem
      id={`extenstion_${item.field}_${item.type}`}
      name={item.name}
      desc={item.description}
      checked={item.value ?? item.default ?? false}
      onchange={(val) => {
        void updateExtensionSettings(id, { [item.field]: val })
      }}
    />
  {:else if item.type === 'selection'}
    <SelectionItem
      name={item.name}
      desc={item.description}
      value={item.value ?? item.default ?? ''}
      list={item.enum.map((n, idx) => ({ label: item.enumName[idx], value: n }))}
      onchange={(val) => {
        void updateExtensionSettings(id, { [item.field]: val })
      }}
    />
  {:else if item.type === 'configCheckbox'}
    <ConfigCheckboxItem
      {item}
      onchange={(val, checked) => {
        void updateExtensionSettings(id, { [item.field]: checked ? val : '' })
      }}
      onremove={async (value) => {
        const newConfig: unknown[] = []
        for (const v of item.enum) {
          if (v.value === value) continue
          newConfig.push($state.snapshot(v.raw))
        }
        const newSetting: Record<string, any> = { [item.enumConfigFiled]: newConfig }
        if (item.value == value) newSetting[item.field] = ''
        await updateExtensionSettings(id, newSetting)
      }}
    />
  {:else if item.type === 'configCheckboxMultiple'}
    <ConfigCheckboxItem
      {item}
      onchange={(val, checked) => {
        const currentValue = [...(item.value ?? [])]
        if (checked) {
          if (!currentValue.includes(val)) {
            currentValue.push(val)
          }
        } else {
          const index = currentValue.indexOf(val)
          if (index > -1) {
            currentValue.splice(index, 1)
          }
        }
        void updateExtensionSettings(id, { [item.field]: currentValue })
      }}
      onremove={async (value) => {
        const newConfig: unknown[] = []
        for (const v of item.enum) {
          if (v.value === value) continue
          newConfig.push($state.snapshot(v.raw))
        }
        const newSetting: Record<string, any> = { [item.enumConfigFiled]: newConfig }
        const targetIdx = item.value?.indexOf(value) ?? -1
        if (targetIdx > -1) {
          const newValues = [...item.value!]
          newValues.splice(targetIdx, 1)
          newSetting[item.field] = newValues
        }
        await updateExtensionSettings(id, newSetting)
      }}
    />
  {/if}
</div>

<style lang="less">
  // .settings-item {
  //   padding-right: 10px;
  // }
</style>
