<script lang="ts">
  import MusicList from '@/components/common/MusicList/MusicList.svelte'
  import { query, replace } from '@/plugins/routes'
  import { getListMusics } from '@/modules/musicLibrary/actions'
  import { musicLibraryEvent } from '@/modules/musicLibrary/store/event'
  import type { ListInfo } from '@/components/common/MusicList/type'
  import { userListInited, userListsAll } from '@/modules/musicLibrary/reactive.svelte'
  import { dateFormat } from '@/shared'
  import {
    getListScrollPosition,
    saveListScrollPosition,
    userListExist,
    sortListMusics,
  } from '@/modules/musicLibrary/store/actions'
  import { type ComponentExports, tick } from 'svelte'
  import { LIST_IDS } from '@any-listen/common/constants'
  import { resourceList } from '@/modules/extension/reactive.svelte'

  let list = $state.raw<AnyListen.Music.MusicInfo[]>([])
  let musicList = $state<ComponentExports<typeof MusicList> | null>(null)
  const pics = {
    [LIST_IDS.LOVE]: 'music_heart',
    [LIST_IDS.DEFAULT]: 'play',
    [LIST_IDS.LAST_PLAYED]: 'time_machine',
  } as const

  const getActiveListInfo = (allList: typeof $userListsAll, activeId: string, resourceList: AnyListen.Extension.ResourceList) => {
    const info = allList.find((l) => l.id == activeId)
    if (!info) return undefined

    return {
      id: info.id,
      name: info.name,
      createTime: info.type == 'default' ? '' : dateFormat(info.meta.createTime, 'Y-M-D'),
      playCount: info.meta.playCount,
      picIcon: pics[info.id as keyof typeof pics],
      getSortTimeFn() {
        if (
          info.type === 'local' ||
          (info.type === 'remote' &&
            resourceList.listProvider.find((l) => l.extensionId === info.meta.extensionId && l.id === info.meta.source)
              ?.fileSortable)
        ) {
          return async (list, type) => {
            return sortListMusics(info.id, list, type)
          }
        }
        return null
      },
    } satisfies ListInfo
  }
  const listInfo = $derived(getActiveListInfo($userListsAll, $query.id, $resourceList))

  let currentId = ''
  const handleScroll = (pos: number) => {
    if (!currentId) return
    void saveListScrollPosition(currentId, pos)
  }

  $effect(() => {
    const id = $query.id
    if (id != currentId) {
      currentId = id
      const musicId = $query.mid
      if (!id) return
      void Promise.all([getListMusics(id), getListScrollPosition(id)]).then(([_list, pos]) => {
        list = _list
        void tick().then(() => {
          let idx = -1
          if (musicId) {
            idx = _list.findIndex((m) => m.id == musicId)
            void replace(`/library?id=${id}`)
          }
          if (idx < 0) {
            musicList?.setScrollPosition(pos)
          } else {
            musicList?.setScrollIndex(idx)
          }
        })
      })
    }
    const unsub = musicLibraryEvent.on('listMusicChanged', (ids) => {
      if (!ids.includes(id) || !userListExist(id)) return
      void getListMusics(id).then((_list) => {
        list = [..._list]
      })
    })
    const unsub2 = musicLibraryEvent.on('listMusicUpdated', (updateInfo) => {
      if (!updateInfo.has(id) || !userListExist(id)) return
      void getListMusics(id).then((_list) => {
        list = [..._list]
      })
    })

    return () => {
      unsub()
      unsub2()
    }
  })

  $effect(() => {
    const id = $query.id
    if (!$userListsAll.some((l) => l.id == id) && $userListInited) {
      void replace(`/library?id=${LIST_IDS.LOVE}`)
    }
  })
</script>

<div class="view-container container">
  {#if listInfo}
    <MusicList bind:this={musicList} listinfo={listInfo} {list} onscroll={handleScroll} local />
  {/if}
</div>

<style lang="less">
  .container {
    position: relative;
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    // border-right: 1px solid var(--color-border);
    // background: #fff;
    // overflow: hidden;
    :global(.slider-content) {
      width: 200px;
    }
  }
  // .list {
  //   flex: auto;
  // }
</style>
