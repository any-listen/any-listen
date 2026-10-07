<script lang="ts">
  import Empty from '@/components/material/Empty.svelte'
  import MusicList from '@/components/common/MusicList/MusicList.svelte'
  import Pagination from '@/components/material/Pagination.svelte'
  import { buildRequestKey, detail } from '@/modules/resource/topSongs/detail/actions'
  import { location, query, getLocation } from '@/plugins/routes'
  import { tick, untrack, type ComponentExports } from 'svelte'
  import { urlParamKeyMap, useActiveSource } from '../../shared.svelte'
  import { saveList, saveListAsGeneral } from './action'
  import { topSongsUrlParamKeyMap } from '../shared.svelte'
  import { pushRoute, replaceRoute, setLastHistory } from '@/modules/resource/actions'

  const activeSource = useActiveSource('topSongs', 'topSongs')

  let list = $state.raw<AnyListen.Music.MusicInfoOnline[]>([])
  let info = $state<AnyListen.Resource.TopSongsDetailInfo | null>(null)
  let listInfo = $state<{
    total: number
    page: number
    limit: number
    loading: boolean
    error: boolean
  }>({ total: 0, page: 1, limit: 1000, loading: false, error: false })
  const searchInfo = {
    extId: '',
    source: '',
    id: '',
    date: '',
  }
  let musicList = $state<ComponentExports<typeof MusicList> | null>(null)

  const handleFetch = (page: number, id: string, date = '') => {
    searchInfo.extId = activeSource.val!.extensionId
    let extId = searchInfo.extId
    searchInfo.source = activeSource.val!.id
    let sourceId = searchInfo.source
    if (id != null) searchInfo.id = id
    if (date != null) searchInfo.date = date
    listInfo.page = page
    const searchId = buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.id, searchInfo.date)
    listInfo.loading = true
    const { promise, total } = detail(extId, sourceId, searchInfo.id, searchInfo.date, page, listInfo.limit)
    listInfo.total = total
    void promise
      .then(({ list: _list, info: _info, total, limit, page }) => {
        if (searchId != buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.id, searchInfo.date)) {
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
        if (searchId != buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.id, searchInfo.date)) {
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
      handleFetch(page, $query.id, $query[topSongsUrlParamKeyMap.date] ?? '')
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
      source="topSongs"
      listinfo={{
        id: searchInfo.id,
        name: info?.name ?? searchInfo.id,
        pic: info?.pic,
        desc: info?.desc,
        createTime: info?.date,
        saveable: true,
        type: 'online',
        listMeta: {
          extensionId: searchInfo.extId,
          source: searchInfo.source,
          date: searchInfo.date,
        },
      }}
      onsave={async () => {
        await saveList({
          id: searchInfo.id,
          name: info?.name ?? searchInfo.id,
          pic: info?.pic,
          desc: info?.desc,
          extensionId: activeSource.val!.extensionId,
          source: activeSource.val!.id,
          date: searchInfo.date,
        })
      }}
      onsaveasgeneral={async () => {
        await saveListAsGeneral({
          id: searchInfo.id,
          name: info?.name ?? searchInfo.id,
          pic: info?.pic,
          desc: info?.desc,
          extensionId: activeSource.val!.extensionId,
          source: activeSource.val!.id,
          date: searchInfo.date,
        })
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
