<script lang="ts">
  import { settingState } from '@/modules/setting/store/state'
  import lyric from './useLyric.svelte'
  import { onMount } from 'svelte'
  import { settingEvent } from '@/modules/setting/store/event'
  import { RGB_Alpha_Shade } from '@any-listen/theme/colorUtils'

  let align = $state(settingState.setting['desktopLyric.classic.style.align'] === 'top' ? 'flex-start' : 'flex-end')
  let fontFamily = $state(settingState.setting['desktopLyric.classic.style.font'])
  let fontSize = $state(`${Math.trunc(settingState.setting['desktopLyric.classic.style.fontSize'])}px`)
  let opacity = $state(settingState.setting['desktopLyric.classic.style.opacity'] / 100)
  // let lineExtendedGap = $state(`${(settingState.setting['desktopLyric.classic.style.lineGap'] / 3).toFixed(2)}px`)
  let isFontWeightFont = $state(settingState.setting['desktopLyric.classic.style.isFontWeightFont'])
  let isFontWeightLine = $state(settingState.setting['desktopLyric.classic.style.isFontWeightLine'])
  let isFontWeightExtended = $state(settingState.setting['desktopLyric.classic.style.isFontWeightExtended'])

  let colorUnplay = $state(settingState.setting['desktopLyric.classic.style.lyricUnplayColor'])
  let colorPlayed = $state(settingState.setting['desktopLyric.classic.style.lyricPlayedColor'])
  let colorShadow = $state(settingState.setting['desktopLyric.classic.style.lyricShadowColor'])
  let colorShadowFont = $state(RGB_Alpha_Shade(0.49, settingState.setting['desktopLyric.classic.style.lyricShadowColor']))

  onMount(() => {
    return settingEvent.on('updated', (keys, setting) => {
      for (const key of keys) {
        if (key === 'desktopLyric.classic.style.align') {
          align = setting['desktopLyric.classic.style.align'] === 'top' ? 'flex-start' : 'flex-end'
        } else if (key === 'desktopLyric.classic.style.font') {
          fontFamily = setting['desktopLyric.classic.style.font']!
        } else if (key === 'desktopLyric.classic.style.fontSize') {
          fontSize = `${Math.trunc(setting['desktopLyric.classic.style.fontSize']!)}px`
        } else if (key === 'desktopLyric.classic.style.opacity') {
          opacity = setting['desktopLyric.classic.style.opacity']! / 100
        } else if (key === 'desktopLyric.classic.style.isFontWeightFont') {
          isFontWeightFont = setting['desktopLyric.classic.style.isFontWeightFont']!
        } else if (key === 'desktopLyric.classic.style.isFontWeightLine') {
          isFontWeightLine = setting['desktopLyric.classic.style.isFontWeightLine']!
        } else if (key === 'desktopLyric.classic.style.isFontWeightExtended') {
          isFontWeightExtended = setting['desktopLyric.classic.style.isFontWeightExtended']!
        } else if (key === 'desktopLyric.classic.style.lyricUnplayColor') {
          colorUnplay = setting['desktopLyric.classic.style.lyricUnplayColor']!
        } else if (key === 'desktopLyric.classic.style.lyricPlayedColor') {
          colorPlayed = setting['desktopLyric.classic.style.lyricPlayedColor']!
        } else if (key === 'desktopLyric.classic.style.lyricShadowColor') {
          colorShadow = setting['desktopLyric.classic.style.lyricShadowColor']!
          colorShadowFont = RGB_Alpha_Shade(0.49, colorShadow)
        }
      }
    })
  })
</script>

<div
  class="lyric"
  class:font-weight-font={isFontWeightFont}
  class:font-weight-line={isFontWeightLine}
  class:font-weight-extended={isFontWeightExtended}
  style:font-family={fontFamily}
  style:opacity
  style:--lrc-font-size={fontSize}
  // style:--line-extended-gap={lineExtendedGap}
  style:--color-lyric-unplay={colorUnplay}
  style:--color-lyric-played={colorPlayed}
  style:--color-lyric-shadow={colorShadow}
  style:--color-lyric-shadow-font-mode={colorShadowFont}
  style:justify-content={align}
  {@attach lyric}
></div>

<style lang="less">
  .lyric {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    gap: 0.5em;
    justify-content: flex-end;
    height: 100%;
    contain: strict;
    overflow: hidden;
    font-size: var(--lrc-font-size, 16px);
    pointer-events: none;
    // text-align: center;
    // font-weight: bold;

    :global {
      > div {
        display: flex;
        // flex: 0 1 50%;
        align-items: center;
        max-width: 100%;
        padding: 0;
        margin: 0;

        &.top {
          justify-content: flex-start;
        }
        &.bottom {
          justify-content: flex-end;
        }
      }

      .font-lrc,
      .shadow {
        padding: 0.08em 0.14em;
        margin: -0.08em 0;
      }

      .line {
        > .font-lrc,
        > .shadow {
          .mixin-ellipsis-2;
        }
      }
      .extended {
        max-width: 100%;
        .font-lrc {
          .mixin-ellipsis-1;
        }
      }

      .font-lrc {
        color: var(--color-lyric-unplay);
      }

      .shadow {
        color: transparent;
        // margin-left: -0.14em;
      }

      .line-content {
        max-width: 100%;
        // padding: calc(var(--lrc-font-size, 16px) / 1.8) 8% calc(var(--lrc-font-size, 16px) / 1.8) 1px;
        color: var(--color-lyric-unplay);
        overflow-wrap: break-word;
        transition: @transition-slow !important;
        transition-property: padding, transform !important;

        .line {
          line-height: 1.2;
        }

        .extended {
          font-size: 0.6em;
        }

        &.line-mode {
          .font-lrc {
            transition: @transition-slow;
            transition-property: color;
          }
        }

        &.line-mode.active .font-lrc,
        &.font-mode.played .font-lrc {
          color: var(--color-lyric-played);
        }

        &.font-mode .extended .font-lrc {
          transition: @transition-slow;
          transition-property: color;
        }

        // &.font-mode > .line {
        //   font-weight: bold;
        // }

        &.font-mode > .line > .font-lrc {
          > span {
            padding-right: 0.12em;
            padding-bottom: 0.12em;
            padding-left: 0.12em;
            margin-right: -0.11em;
            margin-bottom: -0.12em;
            margin-left: -0.11em;
            font-size: 1em;
            background-color: var(--color-lyric-unplay);
            /* stylelint-disable-next-line value-no-vendor-prefix */
            background-image: -webkit-linear-gradient(left, var(--color-lyric-played), var(--color-lyric-played));
            background-image: linear-gradient(to right, var(--color-lyric-played), var(--color-lyric-played));
            background-repeat: no-repeat;
            /* stylelint-disable-next-line property-no-vendor-prefix */
            -webkit-background-clip: text;
            background-clip: text;
            background-size: 0 100%;
            -webkit-text-fill-color: transparent;
          }
        }

        .line .shadow span {
          padding-right: 0.12em;
          padding-bottom: 0.12em;
          padding-left: 0.12em;
          margin-right: -0.11em;
          margin-bottom: -0.12em;
          margin-left: -0.11em;
        }

        // &.line-mode {
        //   .shadow {
        //     text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.40);
        //   }
        // }

        // &.font-mode {
        // }
      }

      .line-mode .font-lrc,
      .extended .font-lrc {
        // text-shadow: 0 0 2px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.3);
        // .stroke3(var(--color-lyric-shadow));

        -webkit-text-stroke: 0.04em var(--color-lyric-shadow);
        paint-order: stroke fill;
        // .stroke2(rgba(0, 0, 0, 0.18));
        // .stroke(1px, rgba(0, 0, 0, 0.08));
        // .stroke(2px, rgba(0, 0, 0, 0.025));
      }

      .font-mode .line .shadow span {
        // .stroke(1px, var(--color-lyric-shadow-font-mode));

        -webkit-text-stroke: 0.05em var(--color-lyric-shadow-font-mode);
        paint-order: stroke fill;
        // text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3),  1px 1px 1px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .font-weight-font {
    :global {
      .font-mode > .line {
        font-weight: bold;
      }
    }
  }

  .font-weight-line {
    :global {
      .line-mode > .line {
        font-weight: bold;
      }
    }
  }

  .font-weight-extended {
    :global {
      .extended {
        font-weight: bold;
      }
    }
  }
</style>
