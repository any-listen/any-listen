<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { addListMusics, removeListMusics } from '@/modules/musicLibrary/actions'
  import { musicLibraryEvent } from '@/modules/musicLibrary/store/event'
  import { checkCollectMusic } from '@/modules/player/store/actions'
  import { t } from '@/plugins/i18n'
  import { LIST_IDS } from '@any-listen/common/constants'
  import { onMount } from 'svelte'

  let {
    musicinfo,
    min = false,
    link = false,
  }: {
    musicinfo?: AnyListen.Music.MusicInfo | null
    min?: boolean
    link?: boolean
  } = $props()

  let loved = $state(false)
  const handleLoveListChange = async (id?: string) => {
    loved = await checkCollectMusic(id)
  }

  $effect(() => {
    void handleLoveListChange(musicinfo?.id)
  })

  onMount(() => {
    return musicLibraryEvent.on('listMusicChanged', (ids) => {
      if (!ids.includes(LIST_IDS.LOVE)) return
      void handleLoveListChange(musicinfo?.id)
    })
  })
</script>

<div class="music-heart-btn" class:unloved={!loved}>
  <Btn
    onclick={async (evt) => {
      evt.stopPropagation()
      if (!musicinfo) return
      if (loved) {
        await removeListMusics(LIST_IDS.LOVE, [musicinfo.id])
      } else {
        await addListMusics(LIST_IDS.LOVE, [musicinfo])
      }
    }}
    {min}
    {link}
    icon
    outline
    aria-label={loved ? $t('music_unlove') : $t('music_love')}
  >
    <SvgIcon name="love" />
  </Btn>
</div>

<style lang="less">
  .music-heart-btn {
    :global {
      .btn {
        svg {
          transition: 0.3s ease;
          transition-property: opacity, filter;
        }
      }
    }

    &.unloved {
      :global {
        .btn {
          color: var(--color-primary-dark-100-alpha-600);
          svg {
            opacity: 0.5;
            filter: grayscale(1);
          }
        }
      }
    }
  }
</style>
