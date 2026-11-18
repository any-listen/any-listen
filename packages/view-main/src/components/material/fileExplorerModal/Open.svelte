<script lang="ts">
  import { t } from '@/plugins/i18n'
  import Btn from '@/components/base/Btn.svelte'
  import ListItem from './ListItem.svelte'
  import { onMount, type ComponentExports } from 'svelte'
  import { buildFilesPath, type File, type FileExplorerOptions } from './shared'
  import { useSelect } from './useSelect.svelte'
  import { useHotkey } from './useHotkey.svelte'
  import { createClickHandle } from '@any-listen/web'
  import FileListModal from './FileListModal.svelte'
  import { closeMessageBoxEvent } from '@/shared/ipc/app/event'

  let {
    onafterleave,
    onsubmit,
  }: {
    onafterleave: () => void
    onsubmit: (result: AnyListen.OpenDialogResult) => void
  } = $props()

  let fileListModal = $state<ComponentExports<typeof FileListModal> | null>(null)
  let select = useSelect({
    get isShiftDown() {
      return options.multi ? hotkey.isShiftDown : false
    },
    get list() {
      return list
    },
  })
  let hotkey = useHotkey({
    getListEl() {
      return fileListModal?.getListEl()
    },
    selectAll() {
      selectAll()
    },
  })
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    list
    select.clearSelect()
  })
  const selectAll = () => {
    if (options.openFile) {
      select.override(list.filter((f) => f.isFile))
    } else {
      select.override([...list])
    }
  }
  onMount(() => {
    const len = list.length
    if (select.selectIndex < len) return
    select.setSelectIndex(len ? len - 1 : 0)
  })
  onMount(() => {
    return closeMessageBoxEvent.on((key) => {
      if (key == options.key) closeModal()
    })
  })

  let options = $state.raw<FileExplorerOptions>({
    title: '',
    onReadDir: async () => [],
    onReadRootDir: async () => [],
  })
  let currentDir = $state('')
  let list = $state.raw<File[]>([])
  let errorMessage = $state('')
  let verifyStatus = $derived(!errorMessage && (select.list.length || (options.openDir && !!currentDir)))

  const closeModal = () => {
    fileListModal?.close()
  }

  const getSelectPath = () => {
    return select.list.length
      ? buildFilesPath(currentDir, [select.list[0]])[0]
      : options.openDir && !!currentDir
        ? currentDir
        : ''
  }

  const handleComfirm = async () => {
    const paths = select.list.length
      ? buildFilesPath(currentDir, select.list)
      : options.openDir && !!currentDir
        ? [currentDir]
        : []
    onsubmit({ canceled: false, filePaths: paths })
    closeModal()
  }

  const handleClick = createClickHandle<[File, number]>(
    (file, index) => {
      if (options.openDir) {
        if (!options.multi) select.clearSelect()
        select.handleSelect(index)
      }
    },
    (file, index) => {
      select.clearSelect()
      void fileListModal?.gotoDir(buildFilesPath(currentDir, [file])[0])
    }
  )

  export const show = async (opts: FileExplorerOptions) => {
    options = opts
    fileListModal?.show({
      modalTitle: options.modalTitle,
      title: options.title,
      defaultPath: options.defaultPath,
      onReadDir: options.onReadDir,
      onReadRootDir: options.onReadRootDir,
    })
  }
</script>

<FileListModal
  {onafterleave}
  onclose={() => {
    onsubmit({ canceled: true, filePaths: [] })
  }}
  bind:this={fileListModal}
  bind:currentDir
  bind:list
  bind:errorMessage
>
  {#snippet listitem(file, index, picStyle)}
    <ListItem
      {file}
      disabled={!options.openFile && file.isFile}
      selected={select.list.includes(file)}
      selectedactive={hotkey.isShiftDown && select.selectIndex == index}
      selectfolder={options.openDir}
      picstyle={picStyle}
      onclick={() => {
        if (file.isFile) {
          if (!options.multi) select.clearSelect()
          select.handleSelect(index)
          if (!hotkey.isKeyMultiKeyDown()) {
            select.setSelectIndex(index)
          }
        } else {
          handleClick(file, index)
        }
      }}
      ongoto={() => {
        if (file.isFile) return
        select.clearSelect()
        void fileListModal?.gotoDir(buildFilesPath(currentDir, [file])[0])
      }}
    />
  {/snippet}
  {#snippet footerleft()}
    {#if options.multi}
      <Btn
        onclick={() => {
          if (select.list.length) {
            select.clearSelect()
          } else {
            selectAll()
          }
        }}>{select.list.length ? $t('btn_unselect_all') : $t('btn_select_all')}</Btn
      >
    {/if}
    {#if options.multi}
      {#if select.list.length}
        <span class="tip">{$t('btn_selected_tip', { num: select.list.length })}</span>
      {/if}
    {:else}
      {@const selectPath = getSelectPath()}
      {#if selectPath}
        <span class="tip" title={selectPath}>{$t('btn_selected_single_tip', { path: selectPath })}</span>
      {/if}
    {/if}
  {/snippet}
  {#snippet footerright()}
    <Btn
      onclick={() => {
        onsubmit({ canceled: true, filePaths: [] })
        closeModal()
      }}>{$t('btn_cancel')}</Btn
    >
    <Btn disabled={!verifyStatus} onclick={handleComfirm}>{options.confirmText || $t('btn_confirm')}</Btn>
  {/snippet}
</FileListModal>

<style lang="less">
  .tip {
    font-size: 12px;
    color: var(--color-font-label);
    .mixin-ellipsis-2;
  }
</style>
