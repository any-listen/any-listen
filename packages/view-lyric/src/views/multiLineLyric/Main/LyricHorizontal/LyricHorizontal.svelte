<script lang="ts">
  import { settingState } from '@/modules/setting/store/state'
  import lyric from './lyric.svelte'
  import { onMount } from 'svelte'
  import { settingEvent } from '@/modules/setting/store/event'
  import { RGB_Alpha_Shade } from '@any-listen/theme/colorUtils'

  let msDown = $state(false)
  let isZoomActiveLrc = $state(settingState.setting['desktopLyric.multiLine.style.isZoomActiveLrc'])

  let fontFamily = $state(settingState.setting['desktopLyric.multiLine.style.font'])
  let fontSize = $state(`${Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize'])}px`)
  let opacity = $state(settingState.setting['desktopLyric.multiLine.style.opacity'] / 100)
  let textAlign = $state(settingState.setting['desktopLyric.multiLine.style.align'])
  let lineGap = $state(`${settingState.setting['desktopLyric.multiLine.style.lineGap']}px`)
  let lineExtendedGap = $state(`${(settingState.setting['desktopLyric.multiLine.style.lineGap'] / 3).toFixed(2)}px`)
  let isFontWeightFont = $state(settingState.setting['desktopLyric.multiLine.style.isFontWeightFont'])
  let isFontWeightLine = $state(settingState.setting['desktopLyric.multiLine.style.isFontWeightLine'])
  let isFontWeightExtended = $state(settingState.setting['desktopLyric.multiLine.style.isFontWeightExtended'])

  let colorUnplay = $state(settingState.setting['desktopLyric.multiLine.style.lyricUnplayColor'])
  let colorPlayed = $state(settingState.setting['desktopLyric.multiLine.style.lyricPlayedColor'])
  let colorShadow = $state(settingState.setting['desktopLyric.multiLine.style.lyricShadowColor'])
  let colorShadowFont = $state(RGB_Alpha_Shade(0.49, settingState.setting['desktopLyric.multiLine.style.lyricShadowColor']))

  onMount(() => {
    return settingEvent.on('updated', (keys, setting) => {
      for (const key of keys) {
        if (key === 'desktopLyric.multiLine.style.isZoomActiveLrc') {
          isZoomActiveLrc = setting['desktopLyric.multiLine.style.isZoomActiveLrc']!
        } else if (key === 'desktopLyric.multiLine.style.font') {
          fontFamily = setting['desktopLyric.multiLine.style.font']!
        } else if (key === 'desktopLyric.multiLine.style.fontSize') {
          fontSize = `${Math.trunc(setting['desktopLyric.multiLine.style.fontSize']!)}px`
        } else if (key === 'desktopLyric.multiLine.style.opacity') {
          opacity = setting['desktopLyric.multiLine.style.opacity']! / 100
        } else if (key === 'desktopLyric.multiLine.style.align') {
          textAlign = setting['desktopLyric.multiLine.style.align']!
        } else if (key === 'desktopLyric.multiLine.style.lineGap') {
          lineGap = `${setting['desktopLyric.multiLine.style.lineGap']}px`
          lineExtendedGap = `${(setting['desktopLyric.multiLine.style.lineGap']! / 3).toFixed(2)}px`
        } else if (key === 'desktopLyric.multiLine.style.isFontWeightFont') {
          isFontWeightFont = setting['desktopLyric.multiLine.style.isFontWeightFont']!
        } else if (key === 'desktopLyric.multiLine.style.isFontWeightLine') {
          isFontWeightLine = setting['desktopLyric.multiLine.style.isFontWeightLine']!
        } else if (key === 'desktopLyric.multiLine.style.isFontWeightExtended') {
          isFontWeightExtended = setting['desktopLyric.multiLine.style.isFontWeightExtended']!
        } else if (key === 'desktopLyric.multiLine.style.lyricUnplayColor') {
          colorUnplay = setting['desktopLyric.multiLine.style.lyricUnplayColor']!
        } else if (key === 'desktopLyric.multiLine.style.lyricPlayedColor') {
          colorPlayed = setting['desktopLyric.multiLine.style.lyricPlayedColor']!
        } else if (key === 'desktopLyric.multiLine.style.lyricShadowColor') {
          colorShadow = setting['desktopLyric.multiLine.style.lyricShadowColor']!
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
    height: 100%;
    contain: strict;
    overflow: hidden;
    font-size: var(--lrc-font-size, 16px);
    // text-align: center;
    cursor: move;
    // font-weight: bold;

    :global {
      .font-lrc,
      .shadow {
        padding: 0.08em 0.14em;
        margin: -0.08em 0;
      }

      .font-lrc {
        color: var(--color-lyric-unplay);
      }

      .shadow {
        color: transparent;
        // margin-left: -0.14em;
      }

      .line-content {
        // padding: calc(var(--lrc-font-size, 16px) / 1.8) 8% calc(var(--lrc-font-size, 16px) / 1.8) 1px;
        margin: var(--line-gap) 0;
        line-height: 1.2;
        color: var(--color-lyric-unplay);
        overflow-wrap: break-word;
        transition: 0.6s ease !important;
        transition-property: padding, transform !important;

        .font-lrc {
          cursor: grab;
        }
        &.active {
          // padding: var(--play-detail-lrc-font-size, 16px) 1px;
          padding-top: calc(var(--lrc-font-size, 16px) * 1.1);
          padding-bottom: calc(var(--lrc-font-size, 16px) * 1.1);
        }

        .extended {
          margin-top: var(--line-extended-gap);
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

        -webkit-text-stroke: 0.05em var(--color-lyric-shadow);
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
    // &.old-browser {
    //   :global {
    //     .line-mode .font-lrc,
    //     .extended .font-lrc {
    //       -webkit-text-stroke: none;
    //       .stroke3(var(--color-lyric-shadow));
    //     }

    //     .font-mode .line .shadow span {
    //       -webkit-text-stroke: none;
    //       .stroke(1px, var(--color-lyric-shadow-font-mode));
    //     }
    //   }
    // }

    // p {
    //   padding: 8px 0;
    //   line-height: 1.2;
    //   overflow-wrap: break-word;
    //   transition: @transition-normal !important;
    //   transition-property: color, font-size;
    // }
  }

  // .lrc-line {
  //   display: inline-block;
  //   padding: 8px 0;
  //   line-height: 1.2;
  //   overflow-wrap: break-word;
  //   transition: @transition-normal;
  //   transition-property: color, font-size, text-shadow;
  //   cursor: grab;
  //   // font-weight: bold;
  //   // background-clip: text;
  //   color: @color-theme-lyric;
  //   text-shadow: 1px 1px 2px #000;
  //   // background: linear-gradient(@color-theme-lyric, @color-theme-lyric);
  //   // background-clip: text;
  //   // -webkit-background-clip: text;
  //   // -webkit-text-fill-color: #fff;
  //   // -webkit-text-stroke: thin #124628;
  // }
  .lyric-space {
    height: 80%;
  }

  // .lyric-text {

  // }
  // .lrc-active {

  //   .lrc-line {
  //     color: @color-theme-lyric_2;
  //     // background: linear-gradient(@color-theme-lyric, @color-theme-lyric_2);
  //     // background-clip: text;
  //     // -webkit-background-clip: text;
  //     // -webkit-text-fill-color: @color-theme-lyric_2;
  //     // -webkit-text-stroke: thin #124628;
  //   }
  // }
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
          // .extended {
          //   // font-size: 1em;
          // }
          // .line {
          //   // font-size: 1.2em;
          // }
        }
      }
    }
    &.text-left {
      :global {
        .line-content {
          padding-right: 12%;
          transform-origin: 0%;
        }
      }
    }
    &.text-center {
      :global {
        .line-content {
          padding-right: 6%;
          padding-left: 6%;
          // transform: scale(1.1);
        }
      }
    }
    &.text-right {
      :global {
        .line-content {
          padding-left: 12%;
          transform-origin: 100%;
        }
      }
    }
  }

  // .ellipsis {
  //   :global {
  //     .font-lrc,
  //     .shadow {
  //       display: -webkit-box !important;
  //       .mixin-ellipsis(1);
  //     }
  //   }
  // }

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

  // .footer {
  //   flex: 0 0 100px;
  //   overflow: hidden;
  //   display: flex;
  //   align-items: center;
  // }
</style>
