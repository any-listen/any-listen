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
    if (event.repeat) return
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
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 100%;
    padding: 5px 2px;
    gap: 10px;
    position: relative;
    transition: 0.3s ease;
    transition-property: color, background-color, opacity;
    background-color: transparent;
    border-radius: @radius-border;
    &:not(.disabled) {
      &:hover {
        background-color: var(--color-primary-background-hover);
        cursor: pointer;
      }
    }
  }
  .disabled {
    opacity: 0.5;
    cursor: default !important;
  }

  .left {
    // background-color: var(--color-primary-light-200-alpha-900);
    border-radius: @radius-border;
    // width: 100%;
    // height: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    // color: var(--color-primary-light-400-alpha-200);
    // user-select: none;
    // font-size: 18px;
    // font-family: Consolas, 'Courier New', monospace;
    flex: none;

    // span {
    //   padding-left: 2px;
    // }
  }

  .right {
    flex: auto;
    display: flex;
    flex-flow: column nowrap;
    font-size: 14px;
    gap: 2px;
    min-width: 0;
    span {
      .mixin-ellipsis-1();
    }
  }
</style>
