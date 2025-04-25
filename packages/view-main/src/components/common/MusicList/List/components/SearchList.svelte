<script lang="ts">
  import Portal from '@/components/base/Portal.svelte'
  import { keyboardEvent } from '@/modules/hotkey/keyboard'
  import { settingState } from '@/modules/setting/store/state'
  import { debounce } from '@/shared'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar'
  import { clipboardReadText } from '@/shared/ipc/app'
  import { t } from '@/plugins/i18n'
  import { workers } from '@/worker'
  import { buildMusicName, buildSourceLabel } from '@any-listen/common/tools'
  import { onMount, tick } from 'svelte'
  import { fly } from 'svelte/transition'
  let {
    list,
    visible = $bindable(),
    onselect,
  }: {
    list: AnyListen.Music.MusicInfo[]
    visible: boolean
    onselect: (idx: number, isPlay: boolean) => void
  } = $props()
  let text = $state('')
  let resultList = $state<AnyListen.Music.MusicInfo[]>([])
  let selectIndex = $state(-1)
  let domContainer = $state<HTMLElement | null>(null)
  let domInput = $state<HTMLInputElement | null>(null)
  let domList = $state<HTMLElement | null>(null)
  let height = $state(0)
  let maxHeight = $state(0)
  let listStyle = $derived(`height: ${height}px; max-height: ${maxHeight}px;`)

  let prevForce: HTMLElement | null
  const setList = (list: AnyListen.Music.MusicInfo[]) => {
    resultList = list
    if (selectIndex > -1) selectIndex = -1
    if (list.length) {
      void tick().then(() => {
        const listHeight = domList!.scrollHeight
        height = listHeight
      })
    } else {
      height = 0
    }
  }
  const handleDelaySearch = debounce(async () => {
    let val = text.trim()
    setList(val.length ? await workers.main.searchListMusic(list, val) : [])
  })
  const handleScrollList = () => {
    if (selectIndex < 0) return
    let dom = domList!.children[selectIndex] as HTMLElement
    let offsetTop = dom.offsetTop
    let scrollTop = domList!.scrollTop
    let top
    if (offsetTop < scrollTop) {
      top = offsetTop
    } else if (offsetTop + dom.clientHeight > domList!.clientHeight + scrollTop) {
      top = offsetTop + dom.clientHeight - domList!.clientHeight
    } else return
    domList!.scrollTo({
      left: 0,
      top,
      behavior: 'smooth',
    })
  }
  const handleContextMenu = async () => {
    let str = await clipboardReadText()
    str = str.trim()
    str = str.replace(/\t|\r\n|\n|\r/g, ' ')
    str = str.replace(/\s+/g, ' ')
    const inputText = domInput!.value
    // if (domInput.selectionStart == domInput.selectionEnd) {
    const value =
      inputText.substring(0, domInput!.selectionStart ?? 0) +
      str +
      inputText.substring(domInput!.selectionEnd ?? 0, inputText.length)
    // event.target.value = value
    text = value
    // } else {
    //   clipboardWriteText(text.substring(domInput.selectionStart, domInput.selectionEnd))
    // }
  }
  const handleListClick = (index: number, isPlay: boolean) => {
    if (index < 0) return
    const id = resultList[index].id
    const idx = list.findIndex((m) => m.id == id)
    onselect(idx, isPlay)
    handleHide()
  }
  const handleHide = () => {
    visible = false
    text = ''
    resultList = []
  }
  const handleResize = () => {
    if (!visible) return
    maxHeight = (domContainer!.parentNode as HTMLElement).clientHeight * 0.8
  }
  $effect(() => {
    if (!visible) {
      prevForce?.focus()
      return
    }
    prevForce = document.activeElement as HTMLElement | null
    void tick().then(() => {
      handleResize()
      domInput?.focus()
    })
  })
  $effect(() => {
    if (!visible) return
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    list
    handleDelaySearch()
  })
  onMount(() => {
    const unsub = keyboardEvent.onAnyKey((event) => {
      // console.log(event)
      switch (event.key) {
        case 'arrowup':
        case 'arrowdown':
          event.event?.preventDefault()
          break
      }
      if (event.type == 'down') {
        switch (event.key) {
          case 'arrowup':
            if (resultList.length) {
              selectIndex = selectIndex - 1 < -1 ? resultList.length - 1 : selectIndex - 1
              handleScrollList()
            } else if (selectIndex > -1) {
              selectIndex = -1
            }
            break
          case 'arrowdown':
            if (resultList.length) {
              selectIndex = selectIndex + 1 < resultList.length ? selectIndex + 1 : 0
              handleScrollList()
            } else if (selectIndex > -1) {
              selectIndex = -1
            }
            break
          case 'enter':
          case 'mod+enter':
            if (selectIndex < 0) return
            event.event?.preventDefault()
            handleListClick(selectIndex, event.key == 'mod+enter')
            break
          case 'escape':
            event.event?.preventDefault()
            // event.stopPropagation()
            if (text.length > 0) {
              text = ''
              setList([])
            } else {
              handleHide()
            }
            break
        }
      }
    })
    // const unsub = keyboardEvent.on('arrowdown', event => {
    //   event.event?.preventDefault()
    //   console.log('arrowdown')
    // })
    // const unsub2 = keyboardEvent.on('arrowup', event => {
    //   event.event?.preventDefault()
    //   console.log('arrowup')
    // })
    // const unsub3 = keyboardEvent.on('arrowup_down', event => {
    //   console.log('object')
    //   if (resultList.length) {
    //     selectIndex = selectIndex - 1 < -1 ? resultList.length - 1 : selectIndex - 1
    //     handleScrollList()
    //   } else if (selectIndex > -1) {
    //     selectIndex = -1
    //   }
    // })
    // const unsub4 = keyboardEvent.on('arrowdown_down', event => {
    //   if (resultList.length) {
    //     selectIndex = selectIndex + 1 < resultList.length ? selectIndex + 1 : 0
    //     handleScrollList()
    //   } else if (selectIndex > -1) {
    //     selectIndex = -1
    //   }
    // })
    // const unsub5 = keyboardEvent.on('enter_down', event => {
    //   event.event?.preventDefault()
    // })
    // const unsub6 = keyboardEvent.on('escape_down', event => {
    //   event.event?.preventDefault()
    //   event.stopPropagation()
    //   if (text.length > 0) {
    //     text = ''
    //     resultList = []
    //   } else {
    //     handleHide()
    //   }
    // })
    // const unsub7 = keyboardEvent.on('mod_down', event => {
    //   event.event?.preventDefault()
    //   isModDown ||= true
    // })
    // const unsub8 = keyboardEvent.on('mod_up', event => {
    //   event.event?.preventDefault()
    //   isModDown &&= false
    // })
    const unsub2 = keyboardEvent.on('mod+f_down', (event) => {
      event.event?.preventDefault()
      event.stopPropagation()
      if (visible) {
        domInput!.focus()
      } else {
        visible = true
      }
    })
    window.addEventListener('resize', handleResize)

    return () => {
      unsub()
      unsub2()
      window.removeEventListener('resize', handleResize)
    }
  })
</script>

<Portal to="#view">
  {#if visible}
    <div
      transition:fly={{ y: -30 }}
      class="search"
      bind:this={domContainer}
      onoutroend={() => {
        height = 0
      }}
    >
      <div class="form">
        <input
          bind:this={domInput}
          bind:value={text}
          class="ignore-esc"
          placeholder="Search for something..."
          oninput={handleDelaySearch}
          oncontextmenu={handleContextMenu}
        />
        <button type="button" onclick={handleHide} aria-label={$t('btn_cancel')}>
          <svg version="1.1" height="70%" viewBox="0 0 212.982 212.982">
            <use xlink:href="#icon-delete" />
          </svg>
        </button>
      </div>
      <div class="list-container" style={listStyle}>
        <div bind:this={domList} class="list" use:verticalScrollbar={{ offset: '0', autoHide: false }}>
          {#each resultList as item, index (item.id)}
            <div
              tabindex="0"
              role="button"
              class="list-item"
              class:select={selectIndex === index}
              onkeydown={() => {}}
              onmouseenter={() => {
                selectIndex = index
              }}
              onclick={() => {
                handleListClick(index, false)
              }}
            >
              <div class="img"></div>
              <div class="text">
                <h3 class="text">
                  {buildMusicName(settingState.setting['download.fileName'], item.name, item.singer)}
                </h3>
                {#if item.meta.albumName}
                  <h3 class="text albumName">{item.meta.albumName}</h3>
                {/if}
              </div>
              <div class="source">{buildSourceLabel(item)}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</Portal>

<style lang="less">
  .search {
    position: absolute;
    width: 60%;
    left: 2%;
    top: 2%;
    // transform: translateX(-50%);
    border-radius: 4px;
    transition:
      box-shadow 0.4s ease,
      background-color @transition-normal;
    display: flex;
    flex-flow: column nowrap;
    // contain: strict;
    background-color: var(--color-primary-light-600-alpha-100);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.07),
      0 2px 4px rgba(0, 0, 0, 0.07),
      0 4px 8px rgba(0, 0, 0, 0.07),
      0 8px 16px rgba(0, 0, 0, 0.07),
      0 16px 32px rgba(0, 0, 0, 0.07),
      0 32px 64px rgba(0, 0, 0, 0.07);

    // &.active {
    //   .form {
    //     input {
    //       border-bottom-left-radius: 0;
    //     }
    //     button {
    //       border-bottom-right-radius: 0;
    //     }
    //   }
    // }
    .form {
      display: flex;
      height: @height-toolbar * 0.52;
      position: relative;
      input {
        flex: auto;
        // border: 1px solid;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        background-color: transparent;
        // border-bottom: 2px solid var(--color-primary);
        // border-color: var(--color-primary);
        border: none;

        outline: none;
        // height: @height-toolbar * .7;
        padding: 0 5px;
        overflow: hidden;
        font-size: 13.5px;
        line-height: @height-toolbar * 0.52 + 5px;
        &::placeholder {
          color: var(--color-button-font);
          font-size: 0.98em;
        }
      }
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        border: none;
        // background-color: @color-search-form-background;
        background-color: transparent;
        outline: none;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        cursor: pointer;
        height: 100%;
        padding: 6px 9px;
        color: var(--color-button-font);
        transition: background-color 0.2s ease;
        opacity: 0.8;

        &:hover {
          background-color: var(--color-button-background-hover);
        }
        &:active {
          background-color: var(--color-button-background-active);
        }
      }
    }
    .list-container {
      position: relative;
      overflow: hidden;
      transition: 0.6s ease;
      transition-property: height;
    }
    .list {
      // background-color: @color-search-form-background;
      font-size: 13px;
      position: relative;
      max-height: 100%;
      // max-height: 70%;
    }
    .list-item {
      position: relative;
      cursor: pointer;
      padding: 8px 5px;
      transition: background-color 0.2s ease;
      line-height: 1.3;
      // overflow: hidden;
      display: flex;
      flex-flow: row nowrap;

      &.select {
        background-color: var(--color-primary-dark-100-alpha-700);
      }
      border-radius: 4px;
      // &:last-child {
      //   border-bottom-left-radius: 4px;
      //   border-bottom-right-radius: 4px;
      // }
    }
  }

  .img {
    flex: none;
  }
  .text {
    flex: auto;
    .mixin-ellipsis-1();
  }
  .albumName {
    font-size: 12px;
    opacity: 0.6;
    .mixin-ellipsis-1();
  }
  .source {
    flex: none;
    font-size: 12px;
    opacity: 0.5;
    padding: 0 5px;
    display: flex;
    align-items: center;
    // transform: rotate(45deg);
    // background-color:
  }
</style>
