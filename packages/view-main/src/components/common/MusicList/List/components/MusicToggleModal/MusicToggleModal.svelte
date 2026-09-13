<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import SourceList from './SourceList.svelte'
  import MusicItem from './MusicItem.svelte'
  import Footer from './Footer.svelte'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import { i18n, t } from '@/plugins/i18n'
  import { getSourceId, useResourceList } from '@/views/Online/shared.svelte'
  import { buildRequestKey, search } from '@/modules/resource/search/music/actions'
  import { playerState } from '@/modules/player/store/state'
  import { addPlayLaterMusic, play, playId, skipNext } from '@/modules/player/store/actions'
  import { addListMusics, getListMusics, removeListMusics, updateListMusicsPosition } from '@/modules/musicLibrary/actions'
  import { showSimpleConfirmModal } from '@/components/apis/dialog'
  import { playerEvent } from '@/modules/player/store/event'

  let {
    onafterleave,
  }: {
    onafterleave?: () => void
  } = $props()

  const resource = useResourceList('search')
  const limit = 20

  const sourceList = $derived(
    resource.val.musicSearch?.map((item) => {
      return {
        ...item,
        sId: getSourceId(item),
      }
    }) ?? []
  )

  let activeSource = $state('')
  let lists = $state.raw<Record<string, AnyListen.Music.MusicInfoOnline[]>>({})
  let isError = $state(false)
  let loading = $state(false)
  let visible = $state(false)
  let musicInfo = $state.raw<AnyListen.Music.MusicInfo | null>(null)
  let listId = ''
  let toggleMusicInfo = $state.raw<AnyListen.Music.MusicInfo | null>(null)
  let searchId = $state('')

  const list = $derived(lists[activeSource] ?? [])
  const noItemLabel = $derived(loading ? $t('list_loading') : isError ? $t('list_error') : $t('no_item'))

  const handleSourceChange = (source: (typeof sourceList)[number]) => {
    if (source.sId === activeSource) return
    activeSource = source.sId
  }

  const handleSearchMusic = async (source: (typeof sourceList)[number]) => {
    if (!visible || !musicInfo?.name) return
    loading = true
    isError = false
    const currentSearchId = buildRequestKey(
      source.extensionId,
      source.id,
      1,
      limit,
      `${listId}-${musicInfo.id}-${musicInfo.name}`
    )
    searchId = currentSearchId

    try {
      const { promise } = search(source.extensionId, source.id, musicInfo.name, musicInfo.singer, 1, limit)
      const { list: result } = await promise
      if (searchId !== currentSearchId) return
      lists = {
        ...lists,
        [source.sId]: result,
      }
      isError = false
    } catch (error) {
      console.log(error)
      if (searchId !== currentSearchId) return
      isError = true
      lists = {
        ...lists,
        [source.sId]: [],
      }
    } finally {
      if (searchId === currentSearchId) loading = false
    }
  }

  const handleClose = () => {
    visible = false
    musicInfo = null
    toggleMusicInfo = null
    searchId = ''
    listId = ''
    lists = {}
    activeSource = ''
    isError = false
    loading = false
  }

  const toggleSource = async (
    listId: string,
    oldMusicInfo: AnyListen.Music.MusicInfo,
    toggleMusicInfo: AnyListen.Music.MusicInfo
  ) => {
    const oldId = oldMusicInfo.id
    const list = await getListMusics(listId)
    let oldIdx = list.findIndex((m) => m.id == oldId)
    if (oldIdx < 0) {
      await addListMusics(listId, [toggleMusicInfo])
      return
    }
    const id = toggleMusicInfo.id
    const index = list.findIndex((m) => m.id == id)
    const removeIds = [oldId]
    if (index > -1) {
      if (!(await showSimpleConfirmModal(i18n.t('music_toggle_duplicate_tip')))) {
        throw new Error('User cancelled the toggle operation')
      }
      removeIds.push(id)
    }
    const isPlayingOld =
      playerState.playMusicInfo &&
      !playerState.playMusicInfo.playLater &&
      playerState.playMusicInfo.source === 'local' &&
      playerState.playMusicInfo.listId == listId &&
      playerState.playMusicInfo.musicInfo.id == oldId
    await removeListMusics(listId, removeIds)
    if (isPlayingOld) {
      const unsub = playerEvent.on('playListMusicChanged', (playList) => {
        const targetMusic = playList.find((m) => !m.playLater && m.source == 'local' && m.musicInfo.id === toggleMusicInfo.id)
        if (targetMusic) {
          unsub()
          playId(targetMusic.itemId)
          console.log('play', targetMusic.itemId)
        }
      })
    }
    await addListMusics(listId, [toggleMusicInfo])
    if (index != -1 && index < oldIdx) oldIdx--
    await updateListMusicsPosition({ listId, ids: [id], position: oldIdx })
  }
  const handleConfirm = async () => {
    if (!musicInfo || !toggleMusicInfo || toggleMusicInfo.id == musicInfo.id) return
    visible = false
    console.log('Confirmed toggle from', musicInfo, 'to', toggleMusicInfo)
    await toggleSource(listId, musicInfo, toggleMusicInfo)
    handleClose()
  }

  const handlePlay = async (music: AnyListen.Music.MusicInfoOnline) => {
    console.log(music)
    toggleMusicInfo = music
    await addPlayLaterMusic([music], `${musicInfo?.name || ''} ${musicInfo?.singer || ''}`.trim(), 'search', true)
    if (playerState.playMusicInfo) void skipNext()
    if (!playerState.playing) play()
  }

  $effect(() => {
    if (!visible) {
      lists = {}
      activeSource = ''
      listId = ''
      musicInfo = null
      toggleMusicInfo = null
      isError = false
      loading = false
      return
    }
    activeSource ||= sourceList[0]?.sId ?? ''
  })

  $effect(() => {
    if (!visible || !activeSource) return
    const source = sourceList.find((item) => item.sId === activeSource)
    if (!source || activeSource in lists) return
    void handleSearchMusic(source)
  })

  export const hide = () => {
    handleClose()
  }

  export const show = async (_musicInfo: AnyListen.Music.MusicInfo, _listId: string) => {
    musicInfo = _musicInfo
    listId = _listId
    visible = true
  }
</script>

<Modal
  bind:visible
  bgclose
  teleport="#view"
  height="100%"
  maxwidth="780px"
  width="80%"
  minheight="0"
  onclose={handleClose}
  {onafterleave}
>
  {#if musicInfo}
    <main class="main">
      <div class="body">
        <SourceList list={sourceList} active={activeSource} onchange={handleSourceChange} />

        <div class="scroll list" {@attach verticalScrollbar({ offset: '0', autoHide: false })}>
          {#if list.length}
            {#each list as item (item.id)}
              <MusicItem {item} onplay={handlePlay} />
            {/each}
          {:else}
            <div class="no-item">
              <p>{noItemLabel}</p>
            </div>
          {/if}
        </div>
      </div>

      <Footer {musicInfo} {toggleMusicInfo} onclose={handleClose} onconfirm={handleConfirm} />
    </main>
  {/if}
</Modal>

<style lang="less">
  .main {
    box-sizing: border-box;
    display: flex;
    flex-flow: column nowrap;
    max-width: 100%;
    height: 100%;
    min-height: 0;
    padding: 10px 7px 0;
  }

  .body {
    display: flex;
    flex: auto;
    gap: 10px;
    min-height: 0;
  }

  .list {
    flex: auto;
    min-width: 0;
    min-height: 100px;
    padding: 0 8px;
    font-size: 13px;
    transition-property: height;

    .no-item {
      position: relative;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      height: 100%;

      p {
        font-size: 16px;
        color: var(--color-font-label);
      }
    }
  }
</style>
