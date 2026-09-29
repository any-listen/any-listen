<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import Modal from '@/components/material/Modal.svelte'
  import { setEditing } from '@/modules/hotkey/store/actions'
  import { keyboardEvent } from '@/modules/hotkey/keyboard'
  import { i18n, t } from '@/plugins/i18n'
  import { onMount } from 'svelte'

  import { showHotkeyCommandModal } from '../CommandModal'
  import { formatHotKeyName, type HotkeyBinding } from '../shared'
  import { useCommands } from '@/modules/command/reactive.svelte'

  let {
    onafterleave,
  }: {
    onafterleave: () => void
  } = $props()

  let visible = $state(false)
  let key = $state('')
  let recordKey = $state('')
  let fullCommand = $state('')
  let recording = $state(false)
  let promise: ((result: HotkeyBinding | null) => void) | null = null
  const commands = useCommands(true)

  const selectedCommand = $derived(commands.val.find((item) => item.fullCommand === fullCommand))
  const keyLabel = $derived.by(() => {
    if (recording) {
      if (recordKey) return formatHotKeyName(recordKey)
      return i18n.t('settings.hotkey.input_placeholder')
    }
    if (!key) return i18n.t('settings.hotkey.unset')
    return formatHotKeyName(key)
  })

  const stopRecord = () => {
    if (!recording) return
    recording = false
    if (recordKey) key = recordKey
    void setEditing(false)
  }

  const close = () => {
    stopRecord()
    visible = false
    promise?.(null)
  }

  const selectCommand = async () => {
    const selected = await showHotkeyCommandModal(fullCommand)
    if (!selected) return
    // eslint-disable-next-line require-atomic-updates
    fullCommand = selected
  }

  const submit = () => {
    visible = false
    stopRecord()
    const target = commands.val.find((item) => item.fullCommand === fullCommand)
    promise?.({
      key,
      fullCommand,
      name: target?.name ?? '',
      description: target?.description ?? '',
    })
  }

  const onAnyKey = (event: AnyListen.KeyDownEevent) => {
    if (!recording) return
    event.event?.preventDefault()
    if (event.type !== 'down' || event.event?.repeat) return
    if (event.key === 'backspace') {
      recordKey = ''
      key = ''
      return
    }
    recordKey = event.key
  }

  export const show = async (payload?: HotkeyBinding) => {
    key = payload?.key ?? ''
    fullCommand = payload?.fullCommand ?? ''
    recording = false
    visible = true
    return new Promise<HotkeyBinding | null>((resolve) => {
      promise = resolve
    })
  }

  export const hide = () => {
    close()
  }

  onMount(() => {
    const unsubscribe = keyboardEvent.onAnyKey(onAnyKey)

    return () => {
      unsubscribe()
      stopRecord()
    }
  })
</script>

<Modal bind:visible teleport="#root" minheight="16rem" maxwidth="36rem" bgclose={false} {onafterleave} onclose={close}>
  <div class="main">
    <div class="field">
      <div class="label">{$t('settings.hotkey.key')}</div>
      <button
        class={['key-input', { recording }]}
        type="button"
        onfocus={() => {
          recording = true
          recordKey = key
          void setEditing(true)
        }}
        onblur={() => {
          stopRecord()
        }}
      >
        {keyLabel}
      </button>
      <p class="tip">{$t('settings.hotkey.key_tip')}</p>
    </div>
    <div class="field">
      <div class="label">{$t('settings.hotkey.command')}</div>
      <button class="command-input" type="button" onclick={selectCommand}>
        {#if selectedCommand}
          <p class="name" aria-label={selectedCommand.name}>{selectedCommand.name}</p>
          {#if selectedCommand.description}
            <p class="desc" aria-label={selectedCommand.description}>{selectedCommand.description}</p>
          {/if}
        {:else}
          <p class="desc">{fullCommand && !selectedCommand ? fullCommand : $t('settings.hotkey.command_placeholder')}</p>
        {/if}
      </button>
      <p class="tip">{$t('settings.hotkey.command_tip')}</p>
    </div>
  </div>
  <div class="footer">
    <Btn onclick={close}>{$t('btn_cancel')}</Btn>
    <Btn disabled={!fullCommand} onclick={submit}>{$t('btn_confirm')}</Btn>
  </div>
</Modal>

<style lang="less">
  .main {
    display: flex;
    flex: auto;
    flex-direction: column;
    gap: 16px;
    min-width: 380px;
    padding: 12px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .label {
    font-size: 13px;
  }
  .key-input,
  .command-input {
    display: flex;
    justify-content: center;
    min-height: 36px;
    padding: 8px 10px;
    color: var(--color-font);
    text-align: left;
    background: var(--color-content-background);
    border: 1px solid var(--color-button-background-hover);
    border-radius: @form-radius;
  }
  .key-input {
    font-size: 15px;
    text-align: center;
    cursor: text;
    transition: 0.2s ease;
    transition-property: color, border-color;
    &.recording {
      color: var(--color-font-label);
      border-color: var(--color-primary-font);
    }
  }
  .command-input {
    flex-flow: column nowrap;
    gap: 2px;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover {
      background: var(--color-button-background-hover);
    }

    .name {
      font-size: 13px;
      .mixin-ellipsis-1;
    }

    .desc {
      font-size: 12px;
      color: var(--color-font-label);
      .mixin-ellipsis-2;
    }
  }
  .tip {
    font-size: 12px;
    color: var(--color-font-label);
  }
  .footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 0 12px 12px;
    :global {
      button {
        min-width: 80px;
      }
    }
  }
</style>
