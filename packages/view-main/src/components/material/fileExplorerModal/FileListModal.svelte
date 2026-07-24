<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import Input from '@/components/base/Input.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import { onMount, tick, type ComponentExports, type Snippet } from 'svelte'
  import { formatPath, getParentDir, type File, type FileExplorerOptions } from './shared'
  import { MEDIA_FILE_TYPES_LOCAL } from '@any-listen/common/constants'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { keyboardEvent } from '@/modules/hotkey/keyboard'

  let {
    currentDir = $bindable(),
    list = $bindable(),
    errorMessage = $bindable(),
    onafterleave,
    onclose,
    footerleft,
    footerright,
    listitem,
  }: {
    currentDir: string
    list: File[]
    errorMessage: string
    onafterleave: () => void
    onclose: () => void
    footerleft?: Snippet
    footerright?: Snippet
    listitem: Snippet<[file: File, index: number, picStyle: string]>
  } = $props()

  const listItemHeight = useListItemHeight(2.6)
  const picStyle = $derived(`height:${listItemHeight.val * 0.6}px;width:${listItemHeight.val * 0.6}px;`)
  let virtualizedList = $state<ComponentExports<typeof VirtualizedList<File>> | null>(null)

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    list
    void tick().then(() => {
      virtualizedList?.getListEl().focus()
    })
  })

  onMount(() => {
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

  interface Options {
    title: FileExplorerOptions['title']
    modalTitle?: FileExplorerOptions['modalTitle']
    defaultPath?: FileExplorerOptions['defaultPath']
    onReadDir: FileExplorerOptions['onReadDir']
    onReadRootDir: FileExplorerOptions['onReadRootDir']
  }
  let visible = $state(false)
  let options = $state.raw<Options>({
    title: '',
    onReadDir: async () => [],
    onReadRootDir: async () => [],
  })
  let dirInputValue = $state('')

  export const gotoDir = async (path?: string, refresh?: boolean) => {
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
                MEDIA_FILE_TYPES_LOCAL.includes(
                  file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() as (typeof MEDIA_FILE_TYPES_LOCAL)[number]
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

  export const getListEl = () => {
    return virtualizedList?.getListEl()
  }
  export const close = () => {
    visible = false
  }
  export const show = async (opts: Options) => {
    options = opts
    void gotoDir(options.defaultPath)
    visible = true
  }
</script>

<Modal
  bind:visible
  teleport="#root"
  bgclose={false}
  title={options.modalTitle}
  {onafterleave}
  width="65%"
  maxwidth="56rem"
  maxheight="80%"
  {onclose}
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
        {@render listitem(file, index, picStyle)}
      {/snippet}
    </VirtualizedList>
    {#if errorMessage}
      <div class="error-view">{errorMessage}</div>
    {/if}
  </div>
  <div class="footer">
    <div class="left">
      {#if footerleft}
        {@render footerleft()}
      {/if}
    </div>
    <div class="right">
      {#if footerright}
        {@render footerright()}
      {/if}
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
    gap: 20px;
    // justify-content: space-between;
    margin: 20px 15px 15px;

    .left {
      display: flex;
      flex: auto;
      flex-direction: row;
      gap: 10px;
      align-items: center;
    }
    // .exts {
    //   font-size: 12px;
    // }
    // .tip {
    //   font-size: 12px;
    //   color: var(--color-font-label);
    //   .mixin-ellipsis-2;
    // }
    .right {
      display: flex;
      flex: none;
      flex-direction: row;
      gap: 10px;
    }

    :global(.btn) {
      min-width: 70px;
    }
  }
</style>
