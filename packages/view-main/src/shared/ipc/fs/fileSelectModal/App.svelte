<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import { t } from '@/plugins/i18n'
  import Btn from '@/components/base/Btn.svelte'
  import Input from '@/components/base/Input.svelte'
  import { readDir, readRootDir } from '../fs'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import ListItem from './ListItem.svelte'
  import { onMount, tick, type ComponentExports } from 'svelte'
  import { buildFilesPath, formatPath, getParentDir, type File } from './shared'
  import { MEDIA_FILE_TYPES } from '@any-listen/common/constants'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { useSelect } from './useSelect.svelte'
  import { useHotkey } from './useHotkey.svelte'
  import { keyboardEvent } from '@/modules/hotkey/keyboard'

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
      return hotkey.isShiftDown
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
      void readRootDir().then(async (files) => {
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
  let options = $state.raw<
    Omit<AnyListen.OpenDialogOptions, 'filters'> & {
      filters?: string[]
      openFile?: boolean
      multi?: boolean
    }
  >({
    title: '',
  })
  let currentDir = $state('')
  let dirInputValue = $state('')
  let list = $state.raw<File[]>([])
  let errorMessage = $state('')
  let verifyStatus = $derived(!errorMessage && (!options.openFile || select.list.length))

  const closeModal = () => {
    visible = false
  }

  const handleComfirm = async () => {
    onsubmit({ canceled: false, filePaths: options.openFile ? buildFilesPath(currentDir, select.list) : [currentDir] })
    closeModal()
  }

  const gotoDir = async (path?: string, refresh?: boolean) => {
    errorMessage = ''
    if (path) {
      path = formatPath(path)
      currentDir = path
      dirInputValue = path
      list = await readDir(path, options.filters)
        .then((files) => {
          return files.map((file) => {
            return {
              ...file,
              id: `${file.name}_${file.isFile}`,
              musicFile:
                file.isFile &&
                MEDIA_FILE_TYPES.includes(
                  file.name.substring(file.name.lastIndexOf('.') + 1) as (typeof MEDIA_FILE_TYPES)[number]
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
      const rootPath = await readRootDir(refresh)
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
  }

  export const show = async ({ filters = [], ...opts }: AnyListen.OpenDialogOptions) => {
    const properties = opts.properties || []
    options = {
      ...opts,
      filters: filters.map((f) => f.extensions).flat(),
      openFile: properties.includes('openFile'),
      multi: properties.includes('multiSelections'),
    }
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
  maxwidth="900px"
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
        void readRootDir().then(async (files) => {
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
          picstyle={picStyle}
          onclick={() => {
            if (file.isFile) {
              select.handleSelect(index)
              if (!hotkey.isKeyMultiKeyDown()) {
                select.setSelectIndex(index)
              }
            } else {
              void gotoDir(buildFilesPath(currentDir, [file])[0])
            }
          }}
        />
      {/snippet}
    </VirtualizedList>
    {#if errorMessage}
      <div class="errorView">{errorMessage}</div>
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
      {#if select.list.length}
        <span class="tip">{$t('btn_selected_tip', { num: select.list.length })}</span>
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
    flex: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 15px;
    text-align: center;
    h2 {
      color: var(--color-font);
      word-break: break-all;
      font-size: 14px;
    }
    :global {
      .btn {
        height: 30px;
        width: 30px;

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
        border-radius: 0;
        border-left: 1px solid var(--color-border);

        + .btn {
          border-left: 1px solid var(--color-border);
          margin-left: 0;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }

  .main {
    flex: auto;
    min-height: 0;
    display: flex;
    flex-flow: column nowrap;
    margin: 0 15px;
    overflow: hidden;
    position: relative;
    // min-height: 300px;

    :global(.list) {
      min-height: 200px;
      min-width: 460px;
      font-size: 13px;
      transition-property: height;
    }
  }
  .errorView {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-font-label);
    padding: 15px;
    word-break: break-all;
  }

  .footer {
    flex: none;
    margin: 20px 15px 15px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;

    .left {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }
    // .exts {
    //   font-size: 12px;
    // }
    .tip {
      font-size: 12px;
      color: var(--color-font-label);
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
