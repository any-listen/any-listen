<script lang="ts">
  import { settingState } from '@/modules/setting/store/state'
  import { buildMusicName, buildSourceLabel } from '@any-listen/common/tools'
  import Btn from '@/components/base/Btn.svelte'
  let {
    info,
    onplay,
    onremove,
  }: {
    info: {
      id: string
      index: number
      musicInfo: AnyListen.Music.MusicInfo
    }
    onplay: () => void
    onremove: () => void
  } = $props()

  let nameLabel = buildMusicName(settingState.setting['download.fileName'], info.musicInfo.name, info.musicInfo.singer)
  let sourceLabel = buildSourceLabel(info.musicInfo)
</script>

<div class="listItem">
  <div class="num">{info.index + 1}</div>
  <div class="textContent">
    <h3 class="text" aria-label={nameLabel}>
      {nameLabel}
    </h3>
    {#if info.musicInfo.meta.albumName}
      <h3 class="text albumName" aria-label={info.musicInfo.meta.albumName}>
        {info.musicInfo.meta.albumName}
      </h3>
    {/if}
  </div>
  <div class="label">{sourceLabel}</div>
  <div class="label">{info.musicInfo.interval}</div>
  <div class="btns">
    <Btn onclick={onplay} icon outline>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 287.386 287.386">
        <use xlink:href="#icon-testPlay" />
      </svg>
    </Btn>
    <Btn onclick={onremove} icon outline>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982">
        <use xlink:href="#icon-delete" />
      </svg>
    </Btn>
  </div>
</div>

<style lang="less">
  .listItem {
    position: relative;
    padding: 0 10px;
    transition: background-color 0.2s ease;
    line-height: 1.4;
    height: 100%;
    // overflow: hidden;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    &:hover {
      background-color: var(--color-primary-background-hover);
    }
    // border-radius: 4px;
    // &:last-child {
    //   border-bottom-left-radius: 4px;
    //   border-bottom-right-radius: 4px;
    // }
  }

  .num {
    flex: none;
    font-size: 12px;
    width: 30px;
    text-align: center;
    color: var(--color-font-label);
  }

  .textContent {
    flex: auto;
    padding-left: 5px;
    min-width: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    overflow: hidden;
  }
  .text {
    max-width: 100%;
    .mixin-ellipsis-1();
  }
  .albumName {
    font-size: 12px;
    opacity: 0.6;
    // .mixin-ellipsis-1();
  }
  .label {
    flex: none;
    font-size: 12px;
    opacity: 0.5;
    padding: 0 5px;
    display: flex;
    align-items: center;
    // transform: rotate(45deg);
    // background-color:
  }
  .btns {
    flex: none;
    // font-size: 12px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    gap: 5px;
    svg {
      width: 80% !important;
      height: 80% !important;
    }
  }
</style>
