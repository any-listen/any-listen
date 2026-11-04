<script lang="ts">
  import { type Snippet, tick } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import { t } from '@/plugins/i18n'

  let {
    placeholder = 'Search for something...',
    oninput,
    onsubmit,
    onbackbtnclick,
    onlistclick,
    oncontextmenu,
    small,
    big,
    searchicon,
  }: {
    placeholder?: string
    onbackbtnclick?: () => void
    oninput?: (text: string) => void
    onsubmit: (text: string) => void
    onlistclick?: (index: number, id: string) => void
    oncontextmenu?: MouseEventHandler<HTMLInputElement>
    small?: boolean
    big?: boolean
    searchicon?: Snippet
  } = $props()

  interface ListItem {
    id: string
    title: string
    label?: string
    desc?: string
  }

  let domInput = $state<HTMLInputElement | null>(null)
  let domList = $state<HTMLDivElement | null>(null)
  let text = $state('')
  let isActive = $state(false)
  let selectIndex = $state(-1)
  let list = $state<ListItem[]>([])
  let listStyle = $state('height: 0')
  let isFocus = false
  let isShowList = false
  let maxHeight = '0'
  let delayHideTimeout: number | null = null

  const showList = () => {
    if (delayHideTimeout) {
      clearTimeout(delayHideTimeout)
      delayHideTimeout = null
    }
    isFocus = true
    isShowList = true
    isActive = true
    maxHeight = `${document.body.clientHeight * 0.6}px`
    listStyle = `height: ${domList?.scrollHeight ?? 0}px; max-height: ${maxHeight};`
  }
  const hideList = () => {
    isShowList = false
    listStyle = `height: 0; max-height: ${maxHeight};`
    void tick().then(() => {
      selectIndex = -1
      isActive = false
    })
  }
  const delayHideList = () => {
    isFocus = false
    if (delayHideTimeout) clearTimeout(delayHideTimeout)
    delayHideTimeout = setTimeout(() => {
      delayHideTimeout = null
      hideList()
    }, 50)
  }
  const handleSearch = () => {
    hideList()
    if (selectIndex < 0) {
      onsubmit(text.trim())
      return
    }
    onlistclick?.(selectIndex, list[selectIndex]?.id ?? '')
  }
  const handleKeyDown = () => {
    if (list.length) {
      selectIndex = selectIndex + 1 < list.length ? selectIndex + 1 : 0
    } else if (selectIndex > -1) {
      selectIndex = -1
    }
  }
  const handleKeyUp = () => {
    if (list.length) {
      selectIndex = selectIndex - 1 < -1 ? list.length - 1 : selectIndex - 1
    } else if (selectIndex > -1) {
      selectIndex = -1
    }
  }
  // const handleContextMenu = () => {
  //   let str = clipboardReadText()
  //   str = str.trim()
  //   str = str.replace(/\t|\r\n|\n|\r/g, ' ')
  //   str = str.replace(/\s+/g, ' ')
  //   if (domInput) {
  //     text = text.substring(0, domInput.selectionStart) + str + text.substring(domInput.selectionEnd, text.length)
  //   }
  // }
  const handleClearList = () => {
    text = ''
    onsubmit(text)
  }

  export const focus = () => {
    domInput?.focus()
  }
  export const setText = (_text: string) => {
    text = _text
  }
  export const setList = (_list: ListItem[]) => {
    list = _list
    if (!isFocus) return
    if (selectIndex > -1) selectIndex = -1
    void tick().then(() => {
      if (isShowList) {
        listStyle = `height: ${domList?.scrollHeight ?? 0}px; max-height: ${document.body.clientHeight * 0.6}px;`
      } else if (list.length) {
        showList()
      }
    })
  }
</script>

<div class="search-input no-drag">
  <div class={['content', { active: isActive, small, big }]}>
    <div class="form">
      {#if onbackbtnclick}
        <button type="button" aria-label={$t('btn_back')} onclick={onbackbtnclick}>
          <svg height="100%" viewBox="0 0 24 24">
            <use xlink:href="#icon-back" />
          </svg>
        </button>
      {/if}
      <input
        bind:this={domInput}
        bind:value={text}
        {placeholder}
        onfocus={showList}
        onblur={delayHideList}
        oninput={(evt) => {
          text = (evt.target as HTMLInputElement).value
          oninput?.(text)
        }}
        onkeydown={(event) => {
          switch (event.key) {
            case 'Enter':
              handleSearch()
              break
            case 'ArrowDown':
              event.preventDefault()
              handleKeyDown()
              break
            case 'ArrowUp':
              event.preventDefault()
              handleKeyUp()
              break
          }
        }}
        {oncontextmenu}
      />
      {#if text}
        <button type="button" aria-label={$t('btn_clear')} onclick={handleClearList}>
          <svg height="100%" viewBox="0 0 24 24">
            <use xlink:href="#icon-window-close" />
          </svg>
        </button>
      {/if}
      <button type="button" aria-label={$t('btn_submit')} onclick={handleSearch}>
        {#if searchicon}
          {@render searchicon()}
        {:else}
          <svg height="100%" viewBox="0 0 30.239 30.239">
            <use xlink:href="#icon-search" />
          </svg>
        {/if}
      </button>
    </div>
    <div class="list-content scroll" style={listStyle}>
      <div
        bind:this={domList}
        role="list"
        class="list"
        onmouseleave={() => {
          selectIndex = -1
        }}
      >
        {#each list as item, index (index)}
          <div
            role="button"
            class="list-item"
            tabindex="0"
            aria-label={item.title}
            onkeydown={(evt) => {
              if (evt.key === 'Enter') {
                onlistclick?.(index, item.id)
              }
            }}
            onfocus={showList}
            onblur={delayHideList}
            class:select={selectIndex === index}
            onmouseenter={() => {
              selectIndex = index
            }}
            onclick={(evt) => {
              evt.stopPropagation()
              onlistclick?.(index, item.id)
            }}
          >
            {#if item.label}
              <div class="list-item-label-title">
                <p class="list-item-title">{item.title}</p>
                <p class="list-item-label">{item.label}</p>
              </div>
            {:else}
              <p class="list-item-title">
                {item.title}
              </p>
            {/if}
            {#if item.desc}
              <p class="list-item-desc">{item.desc}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="less">
  @input-height: @height-toolbar * 0.6;
  .search-input {
    position: relative;
    width: var(--width, 35%);
    min-width: var(--min-width, none);
    max-width: var(--max-width, none);
    height: @input-height;
  }
  .content {
    position: absolute;
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    background-color: var(--color-primary-light-300-alpha-700);
    border-radius: @form-radius;
    transition:
      box-shadow 0.4s ease,
      background-color @transition-fast;

    &.active {
      background-color: var(--color-primary-light-600-alpha-100);
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
      .form {
        input {
          border-bottom-left-radius: 0;
        }
        button {
          border-bottom-right-radius: 0;
        }
      }
    }
    .form {
      position: relative;
      display: flex;
      height: @input-height;
      input {
        flex: auto;
        min-width: 0;
        // height: @height-toolbar * .7;
        padding: 0 5px;
        overflow: hidden;
        font-size: 13.5px;
        // line-height: @input-height + 5px;
        outline: none;
        background-color: transparent;
        // border-bottom: 2px solid var(--color-primary);
        // border-color: var(--color-primary);
        border: none;
        // border: 1px solid;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
        &::placeholder {
          font-size: 0.98em;
          color: var(--color-button-font);
        }
      }
      button {
        display: flex;
        flex: none;
        height: 100%;
        padding: 6px 7px;
        color: var(--color-button-font);
        cursor: pointer;
        outline: none;
        // background-color: @color-search-form-background;
        background-color: transparent;
        border: none;
        transition: background-color 0.2s ease;

        &:last-child {
          border-top-right-radius: 3px;
          border-bottom-right-radius: 3px;
        }

        &:hover {
          background-color: var(--color-button-background-hover);
        }
        &:active {
          background-color: var(--color-button-background-active);
        }
      }
    }
    .list-content {
      height: 0;
      // background-color: @color-search-form-background;
      max-height: 300px;
      // overflow: auto;
      font-size: 13px;
      transition: 0.3s ease;
      transition-property: height;
      .list-item {
        max-width: 100%;
        padding: 8px 5px;
        line-height: 1.3;
        cursor: pointer;
        transition: background-color 0.3s ease;
        .list-item-title {
          .mixin-ellipsis-1();
        }
        .list-item-label-title {
          display: flex;
          justify-content: space-between;
          max-width: 100%;
          .list-item-title {
            flex: none;
            max-width: 100%;
          }
          .list-item-label {
            .mixin-ellipsis-1();

            flex-grow: 0;
            flex-shrink: 1;
            margin-left: 10px;
            font-size: 0.9em;
            color: var(--color-600);
          }
        }

        .list-item-desc {
          font-size: 0.9em;
          color: var(--color-600);
          .mixin-ellipsis-2();
        }

        &.select {
          background-color: var(--color-primary-dark-100-alpha-700);
        }
        &:last-child {
          border-bottom-right-radius: 3px;
          border-bottom-left-radius: 3px;
        }
      }
    }
  }

  .big {
    width: 100%;
    // input {
    //   line-height: 30px;
    // }
    .form {
      height: 30px;
      button {
        padding: 6px 10px;
      }
    }
  }
</style>
