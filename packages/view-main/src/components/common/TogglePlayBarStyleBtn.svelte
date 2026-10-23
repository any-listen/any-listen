<script lang="ts">
  import { t } from '@/plugins/i18n'
  import Btn from '../../base/Btn.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import { settingState } from '@/modules/setting/store/state'

  // 迷你播放器切换按钮：在 full → middle → mini 三种播放栏间循环切换
  // （右键可直接切回 full 完整模式）

  type BarStyle = AnyListen.AppSetting['common.playBarProgressStyle']

  const CYCLE: BarStyle[] = ['full', 'middle', 'mini']

  const barStyle = useSettingValue('common.playBarProgressStyle')

  const isMini = $derived(barStyle.val === 'mini')

  let btnTitle = $derived(
    isMini ? $t('player.play_bar_style_exit_mini') : $t('player.play_bar_style_to_mini')
  )

  const cycleStyle = async () => {
    const current = settingState.setting['common.playBarProgressStyle']
    // centerControl 系列视为 full 处理
    const idx = Math.max(0, CYCLE.indexOf((CYCLE.includes(current) ? current : 'full') as BarStyle))
    const next = CYCLE[(idx + 1) % CYCLE.length]
    await updateSetting({ 'common.playBarProgressStyle': next })
  }

  const backToFull = async (e: MouseEvent) => {
    e.preventDefault()
    if (isMini) await updateSetting({ 'common.playBarProgressStyle': 'full' })
  }
</script>

<div class="icon">
  <Btn
    icon
    link
    onclick={cycleStyle}
    oncontextmenu={backToFull}
    aria-label={btnTitle}
  >
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 512 512">
      {#if isMini}
        <!-- 当前处于迷你模式：显示"还原"图标，点击逐步放大 -->
        <use xlink:href="#icon-window-fullscreen" />
      {:else}
        <!-- 当前为完整模式：显示"缩小"图标，点击切换到迷你模式 -->
        <use xlink:href="#icon-window-fullscreen-exit" />
      {/if}
    </svg>
  </Btn>
</div>

<style lang="less">
  .icon :global {
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      color: inherit !important;
      opacity: 0.55;
      transition: opacity @transition-normal;

      svg {
        filter: drop-shadow(0 0 1px rgb(0 0 0 / 20%));
      }
      &:hover {
        opacity: 0.9;
      }
      &:active {
        opacity: 1;
      }
    }
  }
</style>
