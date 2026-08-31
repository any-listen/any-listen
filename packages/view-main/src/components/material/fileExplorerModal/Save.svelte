<script lang="ts">
  import { i18n, t } from '@/plugins/i18n'
  import Btn from '@/components/base/Btn.svelte'
  import ListItem from './ListItem.svelte'
  import type { ComponentExports } from 'svelte'
  import { buildFilesPath, type File, type FileSaveOptions } from './shared'
  import { createClickHandle } from '@any-listen/web'
  import FileListModal from './FileListModal.svelte'
  import Input from '@/components/base/Input.svelte'
  import { showSimpleConfirmModal } from '@/components/apis/dialog'
  import { filterFileName } from '@/shared'
  import { showInputBox } from '@/components/apis/inputModal/inputBox'

  let {
    onafterleave,
    onsubmit,
  }: {
    onafterleave: () => void
    onsubmit: (result: AnyListen.SaveDialogResult) => void
  } = $props()

  let fileListModal = $state<ComponentExports<typeof FileListModal> | null>(null)
  let fileName = $state('')
  let extension = $state('')
  let confirmText = $state<string | undefined>()

  let currentDir = $state('')
  let list = $state.raw<File[]>([])
  let errorMessage = $state('')
  let selectFolder = $state(false)
  let verifyStatus = $derived(!errorMessage && currentDir && fileName && (!selectFolder || filterFileName(fileName)))
  let createDir: (path: string, name: string) => Promise<string> = async () => ''

  const handleCreateFolder = async () => {
    const name = await showInputBox({
      title: i18n.t('file_explorer.create_folder'),
      prompt: i18n.t('file_explorer.enter_folder_name'),
      placeholder: i18n.t('placeholder_folder_name'),
      validateInput: async (name) => {
        if (!name) return i18n.t('file_explorer.folder_name_empty')
        if (name.trim() !== name) return i18n.t('file_explorer.folder_name_space')
        if (name != filterFileName(name)) return i18n.t('file_explorer.folder_name_invalid')
        if (list.some((f) => !f.isFile && f.name === name)) {
          return i18n.t('file_explorer.folder_name_exists', { name })
        }
      },
    })
    const path = await createDir(currentDir, name)
    if (!path) return
    fileListModal?.gotoDir(currentDir, true)
  }

  const closeModal = () => {
    fileListModal?.close()
  }

  const handleComfirm = async () => {
    if (selectFolder) {
      onsubmit({ canceled: false, filePath: fileName })
    } else {
      let name = fileName
      if (!fileName.endsWith(extension)) {
        if (name.endsWith('.')) name = name.slice(0, -1)
        name = `${name}${extension}`
      }
      if (list.some((f) => f.isFile && f.name === name)) {
        const confirm = await showSimpleConfirmModal(i18n.t('file_explorer.overwrite_confirm', { name }), {
          cancelBtn: i18n.t('cancel_button_text'),
          confirmBtn: i18n.t('confirm_button_text'),
        })
        if (!confirm) return
      }
      onsubmit({ canceled: false, filePath: buildFilesPath(currentDir, [{ name }])[0] })
    }
    closeModal()
  }

  const handleClick = createClickHandle<[File, number]>(
    (file, index) => {
      if (selectFolder) fileName = buildFilesPath(currentDir, [{ name: file.name }])[0]
    },
    (file, index) => {
      void fileListModal?.gotoDir(buildFilesPath(currentDir, [file])[0])
    }
  )

  export const show = async (opts: FileSaveOptions) => {
    if (!opts.selectFolder && opts.defaultFileName) {
      fileName = opts.defaultFileName

      const lastDotIndex = opts.defaultFileName.lastIndexOf('.')
      if (lastDotIndex > -1) {
        extension = opts.defaultFileName.substring(lastDotIndex)
        if (extension.length === 1) extension = ''
      } else {
        extension = ''
      }
    } else {
      fileName = ''
      extension = ''
    }
    confirmText = opts.confirmText
    createDir = opts.onCreateDir
    selectFolder = opts.selectFolder || false
    fileListModal?.show({
      modalTitle: opts.modalTitle,
      title: opts.title,
      defaultPath: opts.defaultPath,
      onReadDir: opts.onReadDir,
      onReadRootDir: opts.onReadRootDir,
    })
  }
</script>

<FileListModal
  {onafterleave}
  onclose={() => {
    onsubmit({ canceled: true, filePath: '' })
  }}
  bind:this={fileListModal}
  bind:currentDir
  bind:list
  bind:errorMessage
>
  {#snippet listitem(file, index, picStyle)}
    <ListItem
      {file}
      picstyle={picStyle}
      onclick={() => {
        if (file.isFile) {
          fileName = file.name
        } else {
          handleClick(file, index)
        }
      }}
      ongoto={() => {
        if (file.isFile) return
        void fileListModal?.gotoDir(buildFilesPath(currentDir, [file])[0])
      }}
    />
  {/snippet}
  {#snippet footerleft()}
    {#if selectFolder}
      <div class="btns">
        <Btn disabled={!currentDir} onclick={handleCreateFolder}>{$t('btn_create_folder')}</Btn>
      </div>
      {#if fileName}
        <span class="tip" title={fileName}>{$t('btn_selected_single_tip', { path: fileName })}</span>
      {/if}
    {:else}
      <p class="label">{$t('file_explorer.file_name')}</p>
      <Input bind:value={fileName} placeholder={$t('placeholder_file_name')} autoflex />
      <div class="btns">
        <Btn disabled={!currentDir} onclick={handleCreateFolder}>{$t('btn_create_folder')}</Btn>
      </div>
    {/if}
  {/snippet}
  {#snippet footerright()}
    <Btn
      onclick={() => {
        onsubmit({ canceled: true, filePath: '' })
        closeModal()
      }}>{$t('btn_cancel')}</Btn
    >
    <Btn disabled={!verifyStatus} onclick={handleComfirm}>{confirmText || $t('btn_confirm')}</Btn>
  {/snippet}
</FileListModal>

<style lang="less">
  .btns {
    flex: none;
  }
  .label {
    font-size: 14px;
  }
  .tip {
    font-size: 12px;
    color: var(--color-font-label);
    .mixin-ellipsis-2;
  }
</style>
