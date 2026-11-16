<script lang="ts">
  import Empty from '@/components/material/Empty.svelte'
  import MusicList from '@/components/common/MusicList/MusicList.svelte'
  import Pagination from '@/components/material/Pagination.svelte'
  import { buildRequestKey, search } from '@/modules/resource/search/music/actions'
  import { query, getLocation } from '@/plugins/routes'
  import { urlParamKeyMap, type SourceType } from '../../shared.svelte'
  import { tick, untrack, type ComponentExports } from 'svelte'
  import { pushRoute, replaceRoute } from '@/modules/resource/actions'

  let { source }: { source?: SourceType } = $props()
  let list = $state.raw<AnyListen.Music.MusicInfoOnline[]>([])
  let listInfo = $state<{
    total: number
    page: number
    limit: number
    loading: boolean
    error: boolean
    id: string
  }>({ total: 0, page: 1, limit: 20, loading: false, error: false, id: 'search' })
  let musicList = $state<ComponentExports<typeof MusicList> | null>(null)
  const searchInfo = {
    extId: '',
    source: '',
    text: '',
  }
  let requestParams: unknown[] = []

  const handleSearch = (page: number, text?: string) => {
    searchInfo.extId = source!.extensionId
    let extId = searchInfo.extId
    searchInfo.source = source!.id
    let sourceId = searchInfo.source
    if (text != null) searchInfo.text = text
    listInfo.page = page
    requestParams = [page, searchInfo.text]
    const searchId = buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.text)
    listInfo.loading = true
    const { promise, total } = search(extId, sourceId, searchInfo.text, '', page, listInfo.limit)
    listInfo.total = total
    listInfo.id = searchId
    void promise
      .then(({ list: _list, total, limit, page }) => {
        if (searchId != buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.text)) {
          return
        }
        if (listInfo.total !== total) listInfo.total = total
        if (listInfo.limit !== limit) listInfo.limit = limit
        if (listInfo.page !== page) listInfo.page = page
        listInfo.error = false
        list = _list
        // console.log(_list)

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
      })
      .catch((err) => {
        console.log(err)
        if (searchId != buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.text)) {
          return
        }
        listInfo.error = true
        list = []
      })
      .finally(() => {
        if (searchId == buildRequestKey(extId, sourceId, page, listInfo.limit, searchInfo.text)) {
          listInfo.loading = false
        }
      })
  }

  $effect(() => {
    if (!source) return
    let page = 1
    if ($query[urlParamKeyMap.page]) {
      let p = parseInt($query[urlParamKeyMap.page])
      if (Number.isNaN(p)) p = 1
      page = p
    }
    untrack(() => {
      handleSearch(page, $query[urlParamKeyMap.query] || '')
    })
  })
</script>

<div class="music-list">
  {#if source}
    <MusicList
      bind:this={musicList}
      {list}
      miniheader
      loading={listInfo.loading}
      error={listInfo.error}
      source="search"
      listinfo={{
        id: listInfo.id,
        name: 'search',
        type: 'online',
        listMeta: {
          extensionId: searchInfo.extId,
          source: searchInfo.source,
        },
        // TODO: save list
      }}
      onreload={() => {
        handleSearch(...(requestParams as [number, string]))
      }}
    />
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
  {:else}
    <Empty />
  {/if}
</div>

<style lang="less">
  .music-list {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-width: 0;
    overflow: hidden;
  }
  .pagination {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
</style>
