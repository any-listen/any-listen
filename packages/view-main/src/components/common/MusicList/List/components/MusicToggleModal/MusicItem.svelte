<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import { t } from '@/plugins/i18n'

  let {
    item,
    onplay,
  }: {
    item: AnyListen.Music.MusicInfoOnline
    onplay: (music: AnyListen.Music.MusicInfoOnline) => void
  } = $props()
</script>

<div class="list-item">
  <div class="text-content" aria-label={`${item.name} - ${item.singer}`}>
    <h3 class="text">{item.name}</h3>
    <h3 class="text album-name">
      {item.singer}
      {#if item.meta.albumName}
        <span> / {item.meta.albumName}</span>
      {/if}
    </h3>
  </div>
  <div class="label">{item.interval}</div>
  <div class="btns">
    <Btn
      icon
      min
      outline
      aria-label={$t('user_list_music_menu__play')}
      onclick={() => {
        onplay(item)
      }}
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 287.386 287.386"
      >
        <use xlink:href="#icon-testPlay" />
      </svg>
    </Btn>
  </div>
</div>

<style lang="less">
  .list-item {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
    align-items: center;
    padding: 8px 5px;
    line-height: 1.4;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--color-primary-background-hover);
    }
  }

  .text-content {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    align-items: flex-start;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    color: var(--color-font);
    text-align: left;
    background: transparent;
    border: none;
  }

  .text {
    max-width: 100%;
    .mixin-ellipsis-1();
  }

  .album-name {
    font-size: 12px;
    opacity: 0.6;
  }

  .label {
    display: flex;
    flex: none;
    align-items: center;
    padding: 0 5px;
    font-size: 12px;
    opacity: 0.5;
  }

  .btns {
    display: flex;
    flex: none;
    align-items: center;
    :global(.btn) {
      --size: 1.8rem;
    }
  }
</style>
