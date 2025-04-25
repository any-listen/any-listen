<script lang="ts">
  import { type Snippet, tick } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import { t } from '@/plugins/i18n'

  let {
    placeholder = 'Search for something...',
    oninput,
    onsubmit,
    onlistclick,
    oncontextmenu,
    small,
    big,
    searchicon,
  }: {
    placeholder?: string
    oninput?: (text: string) => void
    onsubmit: (text: string) => void
    onlistclick?: (index: number, text: string) => void
    oncontextmenu?: MouseEventHandler<HTMLInputElement>
    small?: boolean
    big?: boolean
    searchicon?: Snippet
  } = $props()

  let domInput = $state<HTMLInputElement | null>(null)
  let domList = $state<HTMLDivElement | null>(null)
  let text = $state('')
  let isFocus = $state(false)
  let selectIndex = $state(-1)
  let list = $state<string[]>([])
  let listStyle = $state('height: 0')
  let isShowList = false

  const showList = () => {
    isShowList = true
    listStyle = `height: ${domList?.scrollHeight ?? 0}px`
  }
  const hideList = () => {
    isShowList = false
    listStyle = 'height: 0'
    void tick().then(() => {
      selectIndex = -1
    })
  }
  const handleSearch = () => {
    hideList()
    if (selectIndex < 0) {
      onsubmit(text.trim())
      return
    }
    onlistclick?.(selectIndex, list[selectIndex])
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
  export const setList = (_list: string[]) => {
    list = _list
    if (!isFocus) return
    if (selectIndex > -1) selectIndex = -1
    if (isShowList) {
      void tick().then(() => {
        listStyle = `height: ${domList?.scrollHeight ?? 0}px`
      })
    } else {
      showList()
    }
  }
</script>

<div class="search-input">
  <div class={['content', { active: isFocus, small, big }]}>
    <div class="form">
      <input
        bind:this={domInput}
        bind:value={text}
        {placeholder}
        onfocus={() => {
          isFocus = true
          showList()
        }}
        onblur={() => {
          isFocus = false
          hideList()
        }}
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
    <div class="list-content" style={listStyle}>
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
            aria-label={item}
            onkeydown={(evt) => {
              if (evt.key === 'Enter') {
                onlistclick?.(index, item)
              }
            }}
            class:select={selectIndex === index}
            onmouseenter={() => {
              selectIndex = index
            }}
            onclick={() => {
              onlistclick?.(index, item)
            }}
          >
            <span>{item}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="less">
  .search-input {
    position: relative;
    width: var(--width, 35%);
    height: @height-toolbar * 0.52;
    -webkit-app-region: no-drag;
  }
  .content {
    position: absolute;
    width: 100%;
    border-radius: @form-radius;
    transition:
      box-shadow 0.4s ease,
      background-color @transition-normal;
    display: flex;
    flex-flow: column nowrap;
    background-color: var(--color-primary-light-300-alpha-700);

    &.active {
      background-color: var(--color-primary-light-600-alpha-100);
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2);
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
      display: flex;
      height: @height-toolbar * 0.52;
      position: relative;
      input {
        flex: auto;
        // border: 1px solid;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
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
        flex: none;
        border: none;
        // background-color: @color-search-form-background;
        background-color: transparent;
        outline: none;
        cursor: pointer;
        height: 100%;
        padding: 6px 7px;
        color: var(--color-button-font);
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
      // background-color: @color-search-form-background;
      font-size: 13px;
      transition: 0.3s ease;
      height: 0;
      transition-property: height;
      overflow: hidden;
      .list-item {
        cursor: pointer;
        padding: 8px 5px;
        transition: background-color 0.2s ease;
        line-height: 1.3;
        span {
          .mixin-ellipsis-2();
        }

        &.select {
          background-color: var(--color-primary-dark-100-alpha-700);
        }
        &:last-child {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
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
