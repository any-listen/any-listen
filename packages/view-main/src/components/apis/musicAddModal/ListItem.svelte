<script lang="ts">
  // import Image from '@/components/base/Image.svelte'
  // console.log(querystring)
  let {
    listinfo,
    picstyle,
    disabled = false,
    onclick,
  }: {
    listinfo: AnyListen.List.MyListInfo
    picstyle: string
    disabled?: boolean
    onclick: () => void
  } = $props()

  const handleSelect = () => {
    if (disabled) return
    onclick()
  }
</script>

<div
  class="container"
  role="button"
  tabindex="0"
  class:disabled
  onkeydown={(event) => {
    if (event.repeat || disabled) return
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        event.stopPropagation()
        handleSelect()
        break
    }
  }}
  onclick={handleSelect}
>
  <!-- <div class="container" role="button" tabindex="0" onkeydown={log} onclick={log} {oncontextmenu}> -->
  <div class="left" style={picstyle}>
    <!-- <Image /> -->
  </div>
  <div class="right">
    <span>{listinfo.name}</span>
  </div>
</div>

<style lang="less">
  .container {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: 10px;
    align-items: center;
    height: 100%;
    padding: 5px 2px;
    background-color: transparent;
    border-radius: @radius-border;
    transition: 0.3s ease;
    transition-property: color, background-color, opacity;
    &:not(.disabled) {
      &:hover {
        cursor: pointer;
        background-color: var(--color-primary-background-hover);
      }
    }
  }
  .disabled {
    cursor: default !important;
    opacity: 0.5;
  }

  .left {
    // width: 100%;
    // height: 80%;
    display: flex;
    // color: var(--color-primary-light-400-alpha-200);
    // user-select: none;
    // font-size: 18px;
    // font-family: Consolas, 'Courier New', monospace;
    flex: none;
    align-items: center;
    justify-content: center;
    // background-color: var(--color-primary-light-200-alpha-900);
    border-radius: @radius-border;

    // span {
    //   padding-left: 2px;
    // }
  }

  .right {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    gap: 2px;
    min-width: 0;
    font-size: 14px;
    span {
      .mixin-ellipsis-1();
    }
  }
</style>
