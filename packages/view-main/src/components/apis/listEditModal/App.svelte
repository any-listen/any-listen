<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import { i18n, t } from '@/plugins/i18n'
  import Btn from '@/components/base/Btn.svelte'
  import ListTypeSelect from './ListTypeSelect.svelte'
  import { musicLibraryState } from '@/modules/musicLibrary/store/state'
  import GeneralListForm from './GeneralListForm.svelte'
  import type { ComponentExports } from 'svelte'
  import RemoteListForm from './remoteListForm/RemoteListForm.svelte'
  import { showNotify } from '../notify'
  import LocalListForm from './LocalListForm.svelte'

  let {
    onafterleave,
  }: {
    onafterleave: () => void
  } = $props()

  let visible = $state(false)
  let isEdit = $state(false)
  let listType = $state<AnyListen.List.UserListType>('general')
  let targetId = $state<string | undefined>()
  let form = $state<ComponentExports<typeof GeneralListForm>>()
  let targetInfo = $state<AnyListen.List.UserListInfo | null>(null)

  const closeModal = () => {
    visible = false
  }

  const handleComfirm = async () => {
    try {
      await form?.submit()
    } catch (e) {
      console.error(e)
      const msg = (e as Error).message
      if (isEdit) {
        showNotify(i18n.t('edit_list_modal__edit_failed', { err: msg }))
      } else {
        showNotify(i18n.t('edit_list_modal__create_failed', { err: msg }))
      }
      return
    }
    closeModal()
  }
  export const show = (_targetId?: string, _isEdit = false) => {
    targetId = _targetId
    isEdit = _isEdit
    form?.reset()
    if (_isEdit) {
      const info = musicLibraryState.userLists.find((l) => l.id == _targetId)
      if (!info) return
      targetInfo = info
      listType = info.type
    }
    visible = true
  }

  // $effect(() => {
  //   if (!visible) return
  // })
</script>

<Modal bind:visible teleport="#root" bgclose={false} {onafterleave} maxheight="84%">
  <main class="main">
    <div class="header">
      <h2>{isEdit ? $t('edit_list_modal__edit_title') : $t('edit_list_modal__new_title')}</h2>
    </div>
    <div class="content">
      <ListTypeSelect bind:value={listType} disabled={isEdit} />
      {#if listType == 'general'}
        <GeneralListForm bind:this={form} {targetId} item={targetInfo as AnyListen.List.GeneralListInfo | null} />
      {:else if listType == 'local'}
        <LocalListForm bind:this={form} {targetId} item={targetInfo as AnyListen.List.LocalListInfo | null} />
      {:else if listType == 'remote'}
        <RemoteListForm bind:this={form} {targetId} item={targetInfo as AnyListen.List.RemoteListInfo | null} />
      {/if}
    </div>
    <div class="footer">
      <!-- <Btn onclick={closeModal}>{$t('btn_cancel')}</Btn> -->
      <Btn onclick={handleComfirm}>{$t('btn_confirm')}</Btn>
    </div>
  </main>
</Modal>

<style lang="less">
  .main {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    width: 480px;
    min-height: 0;
    padding: 0 15px;
    // max-height: 100%;
    // overflow: hidden;
  }
  .header {
    flex: none;
    padding: 15px;
    text-align: center;
    h2 {
      color: var(--color-font);
      word-break: break-all;
    }
  }

  .content {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    gap: 10px;
    min-height: 0;
    // font-size: 14px;
    // color: var(--color-font-label);
    // padding: 10px 0 8px;
  }

  .footer {
    display: flex;
    flex: none;
    flex-direction: row;
    gap: 10px;
    margin: 20px 0 15px auto;

    :global(.btn) {
      min-width: 70px;
    }
  }
</style>
