<script lang="ts">
  import type { File } from './shared'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  // console.log(querystring)
  let {
    file,
    picstyle,
    disabled = false,
    selected = false,
    selectfolder = false,
    selectedactive,
    onclick,
    ongoto,
  }: {
    file: File
    picstyle: string
    selected?: boolean
    disabled?: boolean
    selectfolder?: boolean
    selectedactive?: boolean
    onclick: () => void
    ongoto?: () => void
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
        if (selectfolder) {
          if (event.key === ' ') {
            handleSelect()
          } else {
            ongoto?.()
          }
        } else if (file.isFile) {
          handleSelect()
        } else {
          ongoto?.()
        }
        break
    }
  }}
  onclick={() => {
    handleSelect()
  }}
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
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: 5px;
    align-items: center;
    height: 100%;
    padding: 5px;
    font-size: 13px;
    background-color: transparent;
    border: 1px dashed transparent;
    border-radius: @radius-border;
    transition: 0.3s ease;
    transition-property: color, background-color, opacity, border-color;

    &:not(.selected) {
      &:hover {
        background-color: var(--color-primary-background-hover);
      }
    }
    &.selected {
      background-color: var(--color-primary-background-selected);
    }
    &.disabled {
      opacity: 0.5;
    }
    &.selectedactive {
      border-color: var(--color-primary-alpha-700);
    }
  }

  .pic {
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--color-primary-font);
    border-radius: @radius-border;
    :global(svg) {
      width: 100%;
      height: 100%;
      transition: opacity @transition-normal;
    }
  }

  .name {
    flex: auto;
    .mixin-ellipsis-1();
  }
</style>
