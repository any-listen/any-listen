<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import { t } from '@/plugins/i18n'

  let {
    musicInfo,
    toggleMusicInfo,
    onconfirm,
  }: {
    musicInfo: AnyListen.Music.MusicInfo
    toggleMusicInfo: AnyListen.Music.MusicInfo | null
    onclose: () => void
    onconfirm: () => void
  } = $props()

  const getMusicSourceLabel = (musicInfo: AnyListen.Music.MusicInfo) => (musicInfo.isLocal ? 'local' : musicInfo.meta.source)
  const confirmDisabled = $derived(!toggleMusicInfo || musicInfo.id == toggleMusicInfo.id)
</script>

<div class="footer">
  <div class="info">
    <h2>
      <div class="name-label">
        <span class="name">{musicInfo.name}</span>
        <span class="label">{getMusicSourceLabel(musicInfo)} {musicInfo.interval}</span>
      </div>
      <div class="singer">
        {musicInfo.singer}
        {#if musicInfo.meta.albumName}
          <span> / {musicInfo.meta.albumName}</span>
        {/if}
      </div>
    </h2>
    {#if toggleMusicInfo}
      <span class="arrow">→</span>
      <h2>
        <div class="name-label">
          <span class="name">{toggleMusicInfo.name}</span>
          <span class="label">{getMusicSourceLabel(toggleMusicInfo)} {toggleMusicInfo.interval}</span>
        </div>
        <div class="singer">
          {toggleMusicInfo.singer}
          {#if toggleMusicInfo.meta.albumName}
            <span> / {toggleMusicInfo.meta.albumName}</span>
          {/if}
        </div>
      </h2>
    {/if}
  </div>
  <div class="footer-btns">
    <Btn disabled={confirmDisabled} onclick={onconfirm}>
      {$t('btn_confirm')}
    </Btn>
  </div>
</div>

<style lang="less">
  .footer {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 7px;

    .info {
      display: flex;
      flex: auto;
      flex-flow: row nowrap;
      gap: 10px;
      align-items: center;
      min-width: 0;
      font-size: 12px;

      h2 {
        min-width: 0;
        line-height: 1.5;
        color: var(--color-font);
        word-break: break-all;
      }

      .name-label {
        display: flex;
        flex-flow: row nowrap;
      }

      .name {
        .mixin-ellipsis();
      }

      .label {
        flex: none;
        padding: 0 5px;
        font-size: 12px;
        color: var(--color-primary);
        opacity: 0.8;
      }

      .singer {
        color: var(--color-font-label);
        .mixin-ellipsis();
      }

      .arrow {
        flex: none;
      }
    }

    .footer-btns {
      display: flex;
      flex: none;
      gap: 8px;
    }
  }
</style>
