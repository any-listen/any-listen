<script lang="ts">
  import Checkbox from '@/components/base/Checkbox.svelte'
  import { showSimpleConfirmModal } from '@/components/apis/dialog'
  import { useConfig, useEnabled } from '@/modules/hotkey/reactive.svelte'
  import { getHotkeyStatus, saveConfig, saveEnabled, setEditing } from '@/modules/hotkey/store/actions'
  import { i18n, t } from '@/plugins/i18n'
  import { onMount } from 'svelte'

  import { showHotkeyEditModal } from './EditModal'
  import ListItem from './ListItem.svelte'
  import { formatHotKeyName, type HotkeyBinding } from './shared'
  import TitleContent from '../../components/TitleContent.svelte'
  import Btn from '@/components/base/Btn.svelte'

  let {
    type,
  }: {
    type: 'local' | 'global'
  } = $props()

  let hotkeyStatus = $state.raw(new Map<string, boolean>())

  // svelte-ignore state_referenced_locally
  const configs = useConfig(type)
  // svelte-ignore state_referenced_locally
  const enabled = useEnabled(type)
  let bindings = $state.raw<HotkeyBinding[]>([])

  const refreshHotkeyStatus = async () => {
    if (type === 'global') hotkeyStatus = await getHotkeyStatus()
  }

  const persistBindings = async (bindings: HotkeyBinding[]) => {
    await saveConfig(type, Object.fromEntries(bindings.map(({ key, fullCommand }) => [key, fullCommand])))
    await refreshHotkeyStatus()
  }

  const saveWithCheck = async (binding: HotkeyBinding, oldBinding?: HotkeyBinding) => {
    const duplicate = bindings.find((item) => binding.key == item.key)
    if (oldBinding) {
      const nextBindings = [...bindings]
      if (duplicate && duplicate.key != oldBinding.key) {
        const confirm = await showSimpleConfirmModal(
          i18n.t('settings.hotkey.override_confirm', {
            key: formatHotKeyName(binding.key),
            command: duplicate?.name ?? duplicate.fullCommand,
          })
        )
        if (!confirm) return
        const dupIdx = bindings.findIndex((item) => item.key === duplicate.key)
        if (dupIdx >= 0) nextBindings.splice(dupIdx, 1)
      }
      const idx = nextBindings.findIndex((item) => item.key === oldBinding.key)
      nextBindings.splice(idx, 1, binding)
      bindings = nextBindings
      await persistBindings(bindings)
      return
    }
    if (duplicate) {
      const confirm = await showSimpleConfirmModal(
        i18n.t('settings.hotkey.override_confirm', {
          key: formatHotKeyName(binding.key),
          command: duplicate?.name ?? duplicate.fullCommand,
        })
      )
      if (!confirm) return

      const idx = bindings.findIndex((item) => item.key === duplicate.key)
      if (idx >= 0) {
        const nextBindings = [...bindings]
        nextBindings.splice(idx, 1, binding)
        bindings = nextBindings
        await persistBindings(bindings)
        return
      }
    }

    bindings = [...bindings, binding]
    await persistBindings(bindings)
  }

  const openEditor = async (binding?: HotkeyBinding) => {
    const result = await showHotkeyEditModal(binding)
    if (!result) return
    await saveWithCheck(result, binding)
  }

  const removeBinding = async (binding: HotkeyBinding) => {
    const idx = bindings.findIndex((item) => item.key === binding.key)
    if (idx < 0) return
    const nextBindings = [...bindings]
    nextBindings.splice(idx, 1)
    bindings = nextBindings
    await persistBindings(nextBindings)
  }

  onMount(() => {
    void refreshHotkeyStatus()
    return () => {
      void setEditing(false)
    }
  })

  $effect(() => {
    bindings = configs.val.map(([key, command]) => ({
      key,
      fullCommand: command?.fullCommand ?? '',
      name: command?.name ?? '',
      description: command?.description ?? '',
    }))
  })
</script>

<TitleContent name={$t(type === 'local' ? 'settings.hotkey.local' : 'settings.hotkey.global')}>
  <div class="settings-item-content">
    <div class="gap-top">
      <Checkbox
        id={`settings.hotkey.${type}.enable`}
        label={$t('settings.hotkey.enable')}
        checked={enabled.val}
        onchange={(value) => {
          void saveEnabled(type, value)
          void refreshHotkeyStatus()
        }}
      />
    </div>
    <div class="gap-top">
      <div class="bindings">
        {#each bindings as item (item.key)}
          <ListItem
            name={item.name}
            description={item.description}
            keyText={item.key ? formatHotKeyName(item.key) : $t('settings.hotkey.unset')}
            error={type === 'global' && enabled.val && hotkeyStatus.get(item.key) === false}
            onedit={async () => {
              await openEditor(item)
            }}
            onremove={async () => {
              await removeBinding(item)
            }}
          />
        {/each}
        <div>
          <Btn
            middle
            onclick={async () => {
              await openEditor()
            }}
          >
            {$t('settings.hotkey.add')}
          </Btn>
        </div>
      </div>
    </div>
  </div>
</TitleContent>

<style lang="less">
  .bindings {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }
</style>
