<script lang="ts">
  import { onMount } from 'svelte'
  import { query } from '@/plugins/routes'
  import { t } from '@/plugins/i18n'
  import type { SourceType } from '../../shared.svelte'
  import { topSongsUrlParamKeyMap } from '../shared.svelte'
  import { getData } from '@/modules/resource/topSongs/date/actions'
  import { appEvent } from '@/modules/app/store/event'
  import { replaceRoute } from '@/modules/resource/actions'

  let { source }: { source?: SourceType } = $props()

  let list = $state.raw<AnyListen.Resource.TagItem[]>([])
  let value = $state('')
  let popupVisible = $state(false)
  let domBtn = $state<HTMLElement | null>(null)
  let domPopup = $state<HTMLElement | null>(null)
  let popupStyle = $state('width: 645px; max-height: 250px;')
  let defaultLabel = $derived($t('online.topSongs.dates.default'))

  let dateName = $derived.by(() => {
    if (!value) return defaultLabel
    const date = list.find((item) => item.id == value)
    return date?.name ?? value
  })

  const handleToggleTag = (id: string) => {
    replaceRoute('/online', { ...$query, [topSongsUrlParamKeyMap.date]: id })
    popupVisible = false
  }

  const handleShow = (evt: MouseEvent) => {
    evt.stopPropagation()
    popupVisible = !popupVisible
  }

  const handleHide = (evt?: MouseEvent) => {
    if (
      evt &&
      (evt.target == domBtn ||
        domBtn?.contains(evt.target as HTMLElement) ||
        evt.target == domPopup ||
        domPopup?.contains(evt.target as HTMLElement))
    ) {
      return
    }
    popupVisible = false
  }

  const setTagPopupStyle = () => {
    window.setTimeout(() => {
      const domView = document.getElementById('view')
      if (!domView) return
      popupStyle = `width: ${domView.clientWidth - 150}px; max-height: ${domView.clientHeight * 0.65}px;`
    }, 50)
  }

  $effect(() => {
    if (!source) return
    const date = $query[topSongsUrlParamKeyMap.date] || ''
    value = date
    if (!list.length || date == '' || (date && list.some((s) => s.id == date))) return
    replaceRoute('/online', { ...$query, [topSongsUrlParamKeyMap.date]: list[0].id })
  })

  $effect(() => {
    if (!source) return
    const sId = source.sId
    void getData(source.extensionId, source.id, $query.id).then((_dates) => {
      if (source.sId != sId) return
      list = _dates
    })
  })

  onMount(() => {
    setTagPopupStyle()
    const unsub = appEvent.on('fullscreen', setTagPopupStyle)
    return () => {
      unsub()
    }
  })
</script>

<div class={['date-list', { active: popupVisible }]}>
  <button bind:this={domBtn} class="label" onclick={handleShow} aria-label={dateName}>
    <span>{dateName}</span>
    <div class="icon">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 451.847 451.847">
        <use xlink:href="#icon-down" />
      </svg>
    </div>
  </button>

  <div bind:this={domPopup} class="popup" style={popupStyle} aria-hidden={!popupVisible} onclick={(evt) => evt.stopPropagation()}>
    <div class="list scroll">
      <ul>
        <li>
          <button class="date" onclick={() => handleToggleTag('')}>{defaultLabel}</button>
        </li>
        {#each list as date (date.id)}
          <li>
            <button class="date" onclick={() => handleToggleTag(date.id)}>{date.name}</button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<svelte:document onclickcapture={(evt) => handleHide(evt)} />
<svelte:window onresize={setTagPopupStyle} />

<style lang="less">
  .date-list {
    position: relative;
    font-size: 12px;

    &.active {
      .label {
        .icon {
          svg {
            transform: rotate(180deg);
          }
        }
      }
      .popup {
        pointer-events: initial;
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .label {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 8px 15px;
    color: var(--color-font);
    cursor: pointer;
    background: transparent;
    border: none;
    transition: color @transition-normal;

    span {
      flex: auto;
      .mixin-ellipsis-1();
    }

    .icon {
      flex: none;
      margin-left: 7px;
      line-height: 0;

      svg {
        width: 0.8em;
        transform: rotate(0);
        transition: transform 0.2s ease;
      }
    }

    &:hover {
      color: var(--color-primary-font-hover);
    }

    &:active {
      color: var(--color-primary-font-active);
    }
  }

  .popup {
    position: absolute;
    top: 100%;
    right: 8px;
    z-index: 10;
    display: flex;
    max-height: 250px;
    margin-top: 12px;
    pointer-events: none;
    background-color: var(--color-content-background);
    border-radius: 4px;
    opacity: 0;
    filter: drop-shadow(0 0 4px rgb(0 0 0 / 15%));
    transform: scale(0.95, 0.8);
    transform-origin: 100% 0 0;
    transition: 0.25s ease;
    transition-property: transform, opacity;

    &::before {
      position: absolute;
      top: -6px;
      right: 20px;
      width: 0;
      height: 0;
      content: ' ';
      border-right: 8px solid transparent;
      border-bottom: 8px solid var(--color-content-background);
      border-left: 8px solid transparent;
    }
  }

  .list {
    box-sizing: border-box;
    padding: 10px;
  }

  // .type {
  //   padding-top: 10px;
  //   padding-bottom: 3px;
  //   color: var(--color-font-label);
  // }

  .date {
    display: inline-block;
    padding: 8px 10px;
    margin: 5px;
    cursor: pointer;
    background-color: var(--color-button-background);
    border: none;
    border-radius: @radius-progress-border;
    transition: background-color @transition-normal;

    &:hover {
      background-color: var(--color-button-background-hover);
    }

    &:active {
      background-color: var(--color-button-background-active);
    }
  }
</style>
