<script lang="ts">
  import { onMount } from 'svelte'

  import { settingEvent } from '@/modules/setting/store/event'
  import { settingState } from '@/modules/setting/store/state'
  import { RGB_Alpha_Shade } from '@any-listen/theme/colorUtils'

  import lyric from './lyric.svelte'

  let msDown = $state(false)
  let isZoomActiveLrc = $state(settingState.setting['desktopLyric.style.isZoomActiveLrc'])

  let fontFamily = $state(settingState.setting['desktopLyric.style.font'])
  let fontSize = $state(`${Math.trunc(settingState.setting['desktopLyric.style.fontSize'])}px`)
  let opacity = $state(settingState.setting['desktopLyric.style.opacity'] / 100)
  let textAlign = $state(settingState.setting['desktopLyric.style.align'])
  let lineGap = $state(`${settingState.setting['desktopLyric.style.lineGap']}px`)
  let lineExtendedGap = $state(`${(settingState.setting['desktopLyric.style.lineGap'] / 3).toFixed(2)}px`)
  let isFontWeightFont = $state(settingState.setting['desktopLyric.style.isFontWeightFont'])
  let isFontWeightLine = $state(settingState.setting['desktopLyric.style.isFontWeightLine'])
  let isFontWeightExtended = $state(settingState.setting['desktopLyric.style.isFontWeightExtended'])

  let colorUnplay = $state(settingState.setting['desktopLyric.style.lyricUnplayColor'])
  let colorPlayed = $state(settingState.setting['desktopLyric.style.lyricPlayedColor'])
  let colorShadow = $state(settingState.setting['desktopLyric.style.lyricShadowColor'])
  let colorShadowFont = $state(RGB_Alpha_Shade(0.49, settingState.setting['desktopLyric.style.lyricShadowColor']))

  onMount(() => {
    return settingEvent.on('updated', (keys, setting) => {
      for (const key of keys) {
        if (key === 'desktopLyric.style.isZoomActiveLrc') {
          isZoomActiveLrc = setting['desktopLyric.style.isZoomActiveLrc']!
        } else if (key === 'desktopLyric.style.font') {
          fontFamily = setting['desktopLyric.style.font']!
        } else if (key === 'desktopLyric.style.fontSize') {
          fontSize = `${Math.trunc(setting['desktopLyric.style.fontSize']!)}px`
        } else if (key === 'desktopLyric.style.opacity') {
          opacity = setting['desktopLyric.style.opacity']! / 100
        } else if (key === 'desktopLyric.style.align') {
          textAlign = setting['desktopLyric.style.align']!
        } else if (key === 'desktopLyric.style.lineGap') {
          lineGap = `${setting['desktopLyric.style.lineGap']}px`
          lineExtendedGap = `${(setting['desktopLyric.style.lineGap']! / 3).toFixed(2)}px`
        } else if (key === 'desktopLyric.style.isFontWeightFont') {
          isFontWeightFont = setting['desktopLyric.style.isFontWeightFont']!
        } else if (key === 'desktopLyric.style.isFontWeightLine') {
          isFontWeightLine = setting['desktopLyric.style.isFontWeightLine']!
        } else if (key === 'desktopLyric.style.isFontWeightExtended') {
          isFontWeightExtended = setting['desktopLyric.style.isFontWeightExtended']!
        } else if (key === 'desktopLyric.style.lyricUnplayColor') {
          colorUnplay = setting['desktopLyric.style.lyricUnplayColor']!
        } else if (key === 'desktopLyric.style.lyricPlayedColor') {
          colorPlayed = setting['desktopLyric.style.lyricPlayedColor']!
        } else if (key === 'desktopLyric.style.lyricShadowColor') {
          colorShadow = setting['desktopLyric.style.lyricShadowColor']!
          colorShadowFont = RGB_Alpha_Shade(0.49, colorShadow)
        }
      }
    })
  })
</script>

<div
  class="lyric"
  class:draging={msDown}
  class:lrc-active-zoom={isZoomActiveLrc}
  class:text-left={textAlign === 'left'}
  class:text-center={textAlign === 'center'}
  class:text-right={textAlign === 'right'}
  class:font-weight-font={isFontWeightFont}
  class:font-weight-line={isFontWeightLine}
  class:font-weight-extended={isFontWeightExtended}
  style:font-family={fontFamily}
  style:opacity
  style:text-align={textAlign}
  style:--line-gap={lineGap}
  style:--lrc-font-size={fontSize}
  style:--line-extended-gap={lineExtendedGap}
  style:--color-lyric-unplay={colorUnplay}
  style:--color-lyric-played={colorPlayed}
  style:--color-lyric-shadow={colorShadow}
  style:--color-lyric-shadow-font-mode={colorShadowFont}
>
  <div class="lyric-space"></div>
  <div
    {@attach lyric((isMsDown) => {
      msDown = isMsDown
    })}
  ></div>
  <div class="lyric-space"></div>
</div>

<style lang="less">
  .lyric {
    position: relative;
    width: 100%;
    height: 100%;
    contain: strict;
    overflow: scroll hidden;
    font-size: var(--lrc-font-size, 16px);
    cursor: move;
    writing-mode: vertical-rl;

    &::-webkit-scrollbar {
      height: 0;
    }

    :global {
      .font-lrc,
      .shadow {
        padding: 0.14em 0.07em;
        margin: 0 -0.07em;
      }

      .font-lrc {
        color: var(--color-lyric-unplay);
      }

      .shadow {
        color: transparent;
      }

      .line-content {
        margin: 0 var(--line-gap);
        line-height: 1.2;
        color: var(--color-lyric-unplay);
        overflow-wrap: break-word;
        transition: @transition-slow !important;
        transition-property: padding, transform !important;

        .font-lrc {
          cursor: grab;
        }

        &.active {
          padding-right: calc(var(--lrc-font-size, 16px) * 1.1);
          padding-left: calc(var(--lrc-font-size, 16px) * 1.1);
        }

        .extended {
          margin-left: var(--line-extended-gap);
          font-size: 0.8em;
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

        &.font-mode > .line > .font-lrc {
          > span {
            padding: 0.14em;
            margin: -0.08em;
            font-size: 1em;
            background-color: var(--color-lyric-unplay);
            /* stylelint-disable-next-line value-no-vendor-prefix */
            background-image: -webkit-linear-gradient(top, var(--color-lyric-played), var(--color-lyric-played));
            background-image: linear-gradient(to bottom, var(--color-lyric-played), var(--color-lyric-played));
            background-repeat: no-repeat;
            /* stylelint-disable-next-line property-no-vendor-prefix */
            -webkit-background-clip: text;
            background-clip: text;
            background-size: 0 100%;
            transition: @transition-slow;
            transition-property: font-size;
            /* stylelint-disable-next-line property-no-vendor-prefix */
            -webkit-text-fill-color: transparent;
          }
        }

        .line .shadow span {
          padding: 0.14em;
          margin: -0.08em;
        }
      }

      .line-mode .font-lrc,
      .extended .font-lrc {
        // .stroke4(var(--color-lyric-shadow));
        -webkit-text-stroke: 0.05em var(--color-lyric-shadow);
        paint-order: stroke fill;
      }

      .font-mode .line .shadow span {
        // .stroke(1px, var(--color-lyric-shadow-font-mode));

        -webkit-text-stroke: 0.05em var(--color-lyric-shadow-font-mode);
        paint-order: stroke fill;
      }
    }
  }

  .lyric-space {
    width: 80%;
    height: 100%;
  }

  .draging {
    :global {
      .line-content {
        .font-lrc {
          cursor: grabbing;
        }
      }
    }
  }

  .lrc-active-zoom {
    :global {
      .line-content {
        &.active {
          transform: scale(1.14);
        }
      }
    }
    &.text-left {
      :global {
        .line-content {
          padding-bottom: 12%;
          transform-origin: 50% 0%;
        }
      }
    }
    &.text-center {
      :global {
        .line-content {
          padding-top: 6%;
          padding-bottom: 6%;
        }
      }
    }
    &.text-right {
      :global {
        .line-content {
          padding-top: 12%;
          transform-origin: 50% 100%;
        }
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
