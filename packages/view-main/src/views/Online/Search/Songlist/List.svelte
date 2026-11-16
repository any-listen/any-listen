<script lang="ts">
  import { buildRequestKey, search } from '@/modules/resource/search/songlist/actions'
  import { query } from '@/plugins/routes'
  import { urlParamKeyMap, type SourceType } from '../../shared.svelte'
  import { untrack } from 'svelte'
  import Songlist from '../../Songlist/list/Songlist.svelte'

  let { source }: { source?: SourceType } = $props()
  let list = $state.raw<AnyListen.Resource.SongListItem[]>([])
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
    const { promise, total } = search(extId, sourceId, searchInfo.text, page, listInfo.limit)
    listInfo.total = total
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
        console.log(_list)
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

{#if source}
  <Songlist
    sId={source.sId}
    {list}
    {listInfo}
    onreload={() => {
      handleSearch(...(requestParams as [number, string]))
    }}
  />
{/if}
