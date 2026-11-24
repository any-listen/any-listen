<script lang="ts">
  import { getData } from '@/modules/resource/songlist/list/actions'
  import { query } from '@/plugins/routes'
  import { urlParamKeyMap, type SourceType } from '../../shared.svelte'
  import { untrack } from 'svelte'
  import Songlist from './Songlist.svelte'
  import { songlistUrlParamKeyMap } from '../shared.svelte'
  import { generateId } from '@any-listen/common/common'

  let { source }: { source?: SourceType } = $props()
  let list = $state.raw<AnyListen.Resource.SongListItem[]>([])
  let listInfo = $state<{
    total: number
    page: number
    limit: number
    loading: boolean
    error: boolean
  }>({ total: 0, page: 1, limit: 30, loading: false, error: false })
  let requestParams: unknown[] = []
  let searchId = ''

  const handleSearch = (page: number, tag?: string, sort?: string) => {
    if (tag == null || sort == null) return
    const _searchId = generateId()
    searchId = _searchId
    requestParams = [page, tag, sort]
    let extId = source!.extensionId
    let sourceId = source!.id
    listInfo.page = page
    listInfo.loading = true
    const { promise, total } = getData(extId, sourceId, tag, sort, page, listInfo.limit)
    if (total) listInfo.total = total
    void promise
      .then(({ list: _list, total, limit, page }) => {
        if (_searchId != searchId) return
        if (listInfo.total !== total) listInfo.total = total
        if (listInfo.limit !== limit) listInfo.limit = limit
        if (listInfo.page !== page) listInfo.page = page
        listInfo.error = false
        list = _list
      })
      .catch((err) => {
        console.log(err)
        if (_searchId != searchId) return
        listInfo.error = true
        list = []
      })
      .finally(() => {
        if (_searchId != searchId) return
        listInfo.loading = false
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
      handleSearch(page, $query[songlistUrlParamKeyMap.tag] || '', $query[songlistUrlParamKeyMap.sort])
    })
  })
</script>

{#if source}
  <Songlist
    sId={source.sId}
    {list}
    {listInfo}
    onreload={() => {
      handleSearch(...(requestParams as [number, string, string]))
    }}
  />
{/if}
