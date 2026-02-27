<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import { t } from '@/plugins/i18n'
  import Btn from '@/components/base/Btn.svelte'
  import Input from '@/components/base/Input.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import ListItem from './ListItem.svelte'
  import { onMount, tick, type ComponentExports } from 'svelte'
  import { buildFilesPath, formatPath, getParentDir, type File, type FileExplorerOptions } from './shared'
  import { MEDIA_FILE_TYPES } from '@any-listen/common/constants'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { useSelect } from './useSelect.svelte'
  import { useHotkey } from './useHotkey.svelte'
  import { keyboardEvent } from '@/modules/hotkey/keyboard'
  import { createClickHandle } from '@any-listen/web'

  let {
    onafterleave,
    onsubmit,
  }: {
    onafterleave: () => void
    onsubmit: (result: AnyListen.OpenDialogResult) => void
  } = $props()

  const listItemHeight = useListItemHeight(2.6)
  const picStyle = $derived(`height:${listItemHeight.val * 0.6}px;width:${listItemHeight.val * 0.6}px;`)
  let virtualizedList = $state<ComponentExports<typeof VirtualizedList<File>> | null>(null)
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
      return virtualizedList?.getListEl()
    },
    selectAll() {
      selectAll()
    },
  })
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    list
    select.clearSelect()
    void tick().then(() => {
      virtualizedList?.getListEl().focus()
    })
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

    const unsub = keyboardEvent.on('backspace_down', (event) => {
      if (event.inputing) return
      event.event?.preventDefault()
      if (event.event?.repeat) return
      void options.onReadRootDir().then(async (files) => {
        return gotoDir(getParentDir(currentDir, files))
      })
    })
    const unsub2 = keyboardEvent.on('f5_down', (event) => {
      event.event?.preventDefault()
      if (event.event?.repeat) return
      void gotoDir(currentDir)
    })

    return () => {
      unsub()
      unsub2()
    }
  })

  let visible = $state(false)
  let options = $state.raw<FileExplorerOptions>({
    title: '',
    onReadDir: async () => [],
    onReadRootDir: async () => [],
  })
  let currentDir = $state('')
  let dirInputValue = $state('')
  let list = $state.raw<File[]>([])
  let errorMessage = $state('')
  let verifyStatus = $derived(!errorMessage && (select.list.length || (options.openDir && !!currentDir)))

  const closeModal = () => {
    visible = false
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

  const gotoDir = async (path?: string, refresh?: boolean) => {
    errorMessage = ''
    if (path) {
      path = formatPath(path)
      currentDir = path
      dirInputValue = path
      list = await options
        .onReadDir(path, refresh)
        .then((files) => {
          return files.map((file) => {
            return {
              ...file,
              id: `${file.name}_${file.isFile}`,
              musicFile:
                file.isFile &&
                MEDIA_FILE_TYPES.includes(
                  file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() as (typeof MEDIA_FILE_TYPES)[number]
                ),
            }
          })
        })
        .catch((e: Error) => {
          console.error(e)
          errorMessage = e.message
          return []
        })
    } else {
      const rootPath = await options
        .onReadRootDir(refresh)
        .then((files) => {
          return files.map((file) => {
            return {
              ...file,
              id: `${file.name}_${file.isFile}`,
              musicFile: false,
            }
          })
        })
        .catch((e: Error) => {
          console.error(e)
          errorMessage = e.message
          return []
        })
      currentDir = ''
      dirInputValue = ''
      list = rootPath
    }
    const dirs: File[] = []
    const files: File[] = []
    for (const file of list) {
      if (file.isFile) {
        files.push(file)
      } else {
        dirs.push(file)
      }
    }
    list = [...dirs, ...files]
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
      void gotoDir(buildFilesPath(currentDir, [file])[0])
    }
  )

  export const show = async (opts: FileExplorerOptions) => {
    options = opts
    void gotoDir(options.defaultPath)
    visible = true
  }
</script>

<Modal
  bind:visible
  teleport="#root"
  bgclose={false}
  {onafterleave}
  width="65%"
  maxwidth="56rem"
  maxheight="80%"
  onclose={() => {
    onsubmit({ canceled: true, filePaths: [] })
  }}
>
  <div class="header">
    <h2>{options.title}</h2>
    <Btn
      icon
      onclick={() => {
        void gotoDir()
      }}
    >
      <SvgIcon name="home" />
    </Btn>
    <Btn
      icon
      onclick={() => {
        void options.onReadRootDir().then(async (files) => {
          return gotoDir(getParentDir(currentDir, files))
        })
      }}
    >
      <SvgIcon name="back" />
    </Btn>
    <Input
      bind:value={dirInputValue}
      onkeydown={(event) => {
        if (event.key === 'Enter') {
          void gotoDir(dirInputValue.trim())
        }
      }}
    />
    <Btn
      icon
      onclick={() => {
        void gotoDir(currentDir, true)
      }}
    >
      <SvgIcon name="reset" />
    </Btn>
  </div>
  <div class="main">
    <VirtualizedList
      {list}
      keyname="id"
      itemheight={listItemHeight.val}
      bind:this={virtualizedList}
      contain="content"
      containerclass="list"
      scrollbaroffset="0"
    >
      {#snippet row(file, index)}
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
            void gotoDir(buildFilesPath(currentDir, [file])[0])
          }}
        />
      {/snippet}
    </VirtualizedList>
    {#if errorMessage}
      <div class="error-view">{errorMessage}</div>
    {/if}
  </div>
  <div class="footer">
    <div class="left">
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
      <!-- <span class="exts">{options.filters?.map((f) => `*.${f}`).join(', ')}</span> -->
    </div>
    <div class="right">
      <Btn
        onclick={() => {
          onsubmit({ canceled: true, filePaths: [] })
          closeModal()
        }}>{$t('btn_cancel')}</Btn
      >
      <Btn disabled={!verifyStatus} onclick={handleComfirm}>{$t('btn_confirm')}</Btn>
    </div>
  </div>
</Modal>

<style lang="less">
  // .main {
  //   flex: auto;
  //   padding: 0 15px;
  //   width: 600px;
  //   display: flex;
  //   flex-flow: column nowrap;
  //   min-height: 0;
  //   // max-height: 100%;
  //   // overflow: hidden;
  // }
  .header {
    display: flex;
    flex: none;
    flex-direction: row;
    align-items: center;
    padding: 15px;
    text-align: center;
    h2 {
      font-size: 14px;
      color: var(--color-font);
      word-break: break-all;
    }
    :global {
      .btn {
        width: 30px;
        height: 30px;

        &:first-of-type {
          margin-left: 15px;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        + .btn {
          border-left: 1px solid var(--color-border);
          border-radius: 0;
        }
      }
      .input {
        flex: auto;
        height: 30px;
        border-left: 1px solid var(--color-border);
        border-radius: 0;

        + .btn {
          margin-left: 0;
          border-left: 1px solid var(--color-border);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }

  .main {
    position: relative;
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-height: 0;
    margin: 0 15px;
    overflow: hidden;
    // min-height: 300px;

    :global(.list) {
      min-width: 460px;
      min-height: 200px;
      font-size: 13px;
      transition-property: height;
    }
  }
  .error-view {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 15px;
    font-size: 20px;
    color: var(--color-font-label);
    word-break: break-all;
  }

  .footer {
    display: flex;
    flex: none;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    margin: 20px 15px 15px;

    .left {
      display: flex;
      flex-direction: row;
      gap: 10px;
      align-items: center;
    }
    // .exts {
    //   font-size: 12px;
    // }
    .tip {
      font-size: 12px;
      color: var(--color-font-label);
      .mixin-ellipsis-2;
    }
    .right {
      display: flex;
      flex-direction: row;
      gap: 10px;
    }

    :global(.btn) {
      min-width: 70px;
    }
  }
</style>
