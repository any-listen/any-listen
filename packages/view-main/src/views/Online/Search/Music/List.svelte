<script lang="ts">
  import Empty from '@/components/material/Empty.svelte'
  import MusicList from '@/components/common/MusicList/MusicList.svelte'
  import type { SourceType } from '../shared'
  import Pagination from '@/components/material/Pagination.svelte'
  import { search } from '@/modules/extension/onlineResource/search/music/actions'
  import { query, push } from '@/plugins/routes'

  let { source }: { source?: SourceType } = $props()
  let list = $state.raw<AnyListen.Music.MusicInfoOnline[]>([])
  let listInfo = $state<{
    total: number
    page: number
    limit: number
    loading: boolean
    error: boolean
  }>({ total: 0, page: 1, limit: 20, loading: false, error: false })
  const searchInfo = {
    extId: '',
    source: '',
    text: '',
  }

  const handleSearch = (page: number, text?: string) => {
    let extId = (searchInfo.extId = source!.extensionId)
    let sourceId = (searchInfo.source = source!.id)
    if (text != null) searchInfo.text = text
    listInfo.page = page
    const searchId = `${searchInfo.extId}_${searchInfo.source}_${searchInfo.text}_${listInfo.page}`
    listInfo.loading = true
    void search(extId, sourceId, searchInfo.text, '', page, listInfo.limit)
      .then(({ list: _list, total }) => {
        if (searchId != `${searchInfo.extId}_${searchInfo.source}_${searchInfo.text}_${listInfo.page}`) {
          return
        }
        listInfo.total = total
        listInfo.error = false
        list = _list
        // console.log(_list)
      })
      .catch((err) => {
        console.log(err)
        if (searchId != `${searchInfo.extId}_${searchInfo.source}_${searchInfo.text}_${listInfo.page}`) {
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
    if (!source) return
    let page = 1
    if ($query.page) {
      let p = parseInt($query.page)
      if (Number.isNaN(p)) p = 1
      page = p
    }
    handleSearch(page, $query.text || '')
  })
</script>

<div class="music-list">
  {#if source}
    <MusicList
      {list}
      miniheader
      listinfo={{
        id: 'search',
        name: 'search',
      }}
    />
    <div class="pagination">
      <Pagination
        count={listInfo.total}
        page={listInfo.page}
        limit={listInfo.limit}
        onclick={(page) => {
          void push('/online', {
            ...$query,
            page,
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
    flex: auto;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
  }
  .pagination {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
</style>
