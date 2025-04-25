<script lang="ts">
  import type { File } from './shared'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  // console.log(querystring)
  let {
    file,
    picstyle,
    disabled = false,
    selected = false,
    selectedactive,
    onclick,
  }: {
    file: File
    picstyle: string
    selected?: boolean
    disabled?: boolean
    selectedactive?: boolean
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
  class:selected
  class:selectedactive
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
  <div class="pic" style={picstyle}>
    {#if file.isFile}
      {#if file.musicFile}
        <SvgIcon name="audio_file" />
      {:else}
        <SvgIcon name="file" />
      {/if}
    {:else}
      <SvgIcon name="folder" />
    {/if}
  </div>
  <div class="name" aria-label={file.name}>
    {file.name}
  </div>
</div>

<style lang="less">
  .container {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 100%;
    padding: 5px;
    gap: 5px;
    position: relative;
    transition: 0.3s ease;
    background-color: transparent;
    border-radius: @radius-border;
    font-size: 13px;
    border: 1px dashed transparent;
    transition-property: color, background-color, opacity, border-color;

    &:not(.selected) {
      &:hover {
        background-color: var(--color-primary-background-hover);
      }
    }
    &.selected {
      background-color: var(--color-primary-background-selected);
    }
    &.selectedactive {
      border-color: var(--color-primary-alpha-700);
    }
  }

  .pic {
    flex: none;
    position: relative;
    border-radius: @radius-border;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary-font);
    :global(svg) {
      transition: opacity @transition-normal;
      height: 100%;
      width: 100%;
    }
  }

  .name {
    flex: auto;
    .mixin-ellipsis-1();
  }
</style>
