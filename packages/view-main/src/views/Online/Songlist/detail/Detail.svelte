<script lang="ts">
  import Empty from '@/components/material/Empty.svelte'
  import MusicList from '@/components/common/MusicList/MusicList.svelte'
  import Pagination from '@/components/material/Pagination.svelte'
  import { buildRequestKey, detail } from '@/modules/resource/songlist/detail/actions'
  import { location, query, getLocation } from '@/plugins/routes'
  import { tick, untrack, type ComponentExports } from 'svelte'
  import { urlParamKeyMap, useActiveSource } from '../../shared.svelte'
  import { saveList, saveListAsGeneral } from './action'
  import { pushRoute, replaceRoute, setLastHistory } from '@/modules/resource/actions'

  const activeSource = useActiveSource('songlist', 'songlist')

  let list = $state.raw<AnyListen.Music.MusicInfoOnline[]>([])
  let info = $state<AnyListen.Resource.SongListDetailInfo | null>(null)
  let listInfo = $state<{
    total: number
    page: number
    limit: number
    loading: boolean
    error: boolean
  }>({ total: 0, page: 1, limit: 10000, loading: false, error: false })
  const searchInfo = {
    extId: '',
    source: '',
    id: '',
  }
  let musicList = $state<ComponentExports<typeof MusicList> | null>(null)
  let requestParams: unknown[] = []

  const handleFetch = (page: number, id?: string) => {
    searchInfo.extId = activeSource.val!.extensionId
    let extId = searchInfo.extId
    searchInfo.source = activeSource.val!.id
    let sourceId = searchInfo.source
    if (id != null) searchInfo.id = id
    listInfo.page = page
    requestParams = [page, searchInfo.id]
    const searchId = buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.id)
    listInfo.loading = true
    const { promise, total } = detail(extId, sourceId, searchInfo.id, page, listInfo.limit)
    listInfo.total = total
    void promise
      .then(({ list: _list, info: _info, total, limit, page }) => {
        if (searchId != buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.id)) {
          return
        }
        if (listInfo.total !== total) listInfo.total = total
        if (listInfo.limit !== limit) listInfo.limit = limit
        if (listInfo.page !== page) listInfo.page = page
        listInfo.error = false
        list = _list
        info = _info

        const {
          location,
          query: { mid, ...q },
        } = getLocation()
        if (mid) {
          void tick().then(() => {
            const idx = _list.findIndex((m) => m.id == mid)
            if (idx != -1) {
              musicList?.setScrollIndex(idx, false)
            }
            replaceRoute(location, q)
          })
        }
        // console.log(_list)
      })
      .catch((err) => {
        console.log(err)
        if (searchId != buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.id)) {
          return
        }
        listInfo.error = true
        list = []
      })
      .finally(() => {
        listInfo.loading = false
      })
  }

  $effect(() => {
    if (!activeSource.val || !$query.id) return
    let page = 1
    if ($query[urlParamKeyMap.page]) {
      let p = parseInt($query[urlParamKeyMap.page])
      if (Number.isNaN(p)) p = 1
      page = p
    }
    untrack(() => {
      handleFetch(page, $query.id)
    })
  })

  $effect(() => {
    setLastHistory($location, { ...$query })
  })
</script>

<div class="music-list">
  {#if activeSource.val}
    <MusicList
      bind:this={musicList}
      {list}
      loading={listInfo.loading}
      error={listInfo.error}
      source="songlist"
      listinfo={{
        id: searchInfo.id,
        name: info?.name ?? searchInfo.id,
        pic: info?.img,
        desc: info?.desc,
        saveable: true,
        type: 'online',
        listMeta: {
          extensionId: searchInfo.extId,
          source: searchInfo.source,
        },
      }}
      onsave={async () => {
        await saveList({
          id: searchInfo.id,
          name: info?.name ?? searchInfo.id,
          pic: info?.img,
          desc: info?.desc,
          extensionId: activeSource.val!.extensionId,
          source: activeSource.val!.id,
        })
      }}
      onsaveasgeneral={async () => {
        await saveListAsGeneral({
          id: searchInfo.id,
          name: info?.name ?? searchInfo.id,
          pic: info?.img,
          desc: info?.desc,
          extensionId: activeSource.val!.extensionId,
          source: activeSource.val!.id,
        })
      }}
      onreload={() => {
        handleFetch(...(requestParams as [number, string]))
      }}
    />
    {#if listInfo.total > listInfo.limit}
      <div class="pagination">
        <Pagination
          count={listInfo.total}
          page={listInfo.page}
          limit={listInfo.limit}
          onclick={(page) => {
            const loc = getLocation()
            pushRoute(loc.location, {
              ...loc.query,
              [urlParamKeyMap.page]: page,
            })
          }}
        />
      </div>
    {/if}
  {:else}
    <Empty />
  {/if}
</div>

<style lang="less">
  .music-list {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;
    overflow: hidden;
  }
  .pagination {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
</style>
