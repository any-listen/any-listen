<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import Modal from '@/components/material/Modal.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import { useCommands } from '@/modules/command/reactive.svelte'
  import { t } from '@/plugins/i18n'
  import ListItem from './ListItem.svelte'

  let {
    onafterleave,
  }: {
    onafterleave: () => void
  } = $props()

  let visible = $state(false)
  let selectedCommand = $state('')
  let promise: ((result: string | null) => void) | null = null
  const commands = useCommands(true)
  const listItemHeight = useListItemHeight(2.9)

  const close = () => {
    visible = false
    promise?.(null)
  }

  const confirm = () => {
    if (!selectedCommand) return
    visible = false
    promise?.(selectedCommand)
  }

  const pick = (command: string) => {
    selectedCommand = command
  }

  const afterLeave = () => {
    onafterleave?.()
  }

  export const show = async (_selectedCommand: string) => {
    selectedCommand = _selectedCommand
    visible = true
    return new Promise<string | null>((resolve) => {
      promise = resolve
    })
  }

  export const hide = () => {
    close()
  }
</script>

<Modal bind:visible teleport="#root" minheight="20rem" maxwidth="52rem" bgclose={false} onafterleave={afterLeave} onclose={close}>
  <div class="header">
    <h2>{$t('settings.hotkey.command')}</h2>
  </div>
  <div class="main">
    <VirtualizedList
      list={commands.val}
      keyname="fullCommand"
      containerclass="list"
      itemheight={listItemHeight.val}
      contain="content"
      scrollbaroffset="0"
    >
      {#snippet row(command)}
        <ListItem {command} active={selectedCommand === command.fullCommand} onpick={pick} />
      {/snippet}
    </VirtualizedList>
  </div>
  <div class="footer">
    <Btn onclick={close}>{$t('btn_cancel')}</Btn>
    <Btn disabled={!selectedCommand} onclick={confirm}>{$t('btn_confirm')}</Btn>
  </div>
</Modal>

<style lang="less">
  .header {
    flex: none;
    padding: 12px 12px 0;
    text-align: center;
    h2 {
      font-size: 14px;
      word-break: break-all;
    }
  }
  .main {
    display: flex;
    flex: auto;
    flex-direction: column;
    min-height: 0;
    padding: 10px 12px 0;

    :global(.list) {
      min-width: 460px;
      min-height: 200px;
      font-size: 13px;
    }
  }
  .footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 12px;
    :global {
      button {
        min-width: 80px;
      }
    }
  }
</style>
