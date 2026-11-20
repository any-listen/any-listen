<script lang="ts">
  import { getData } from '@/modules/resource/topSongs/list/actions'
  import type { SourceType } from '../../shared.svelte'
  import { untrack } from 'svelte'
  import Songlist from './Songlist.svelte'
  import { generateIdSimple } from '@/shared'

  let { source }: { source?: SourceType } = $props()
  let list = $state.raw<AnyListen.Resource.TopSongsItem[]>([])
  let listInfo = $state<{
    loading: boolean
    error: boolean
  }>({ loading: false, error: false })
  let searchKey: string

  const handleSearch = () => {
    let extId = source!.extensionId
    let sourceId = source!.id
    const key = generateIdSimple()
    searchKey = key
    listInfo.loading = true
    void getData(extId, sourceId)
      .then((_list) => {
        if (key != searchKey) return
        listInfo.error = false
        list = _list
        console.log(_list)
      })
      .catch((err) => {
        console.log(err)
        if (key != searchKey) return
        listInfo.error = true
        list = []
      })
      .finally(() => {
        if (key == searchKey) listInfo.loading = false
      })
  }

  $effect(() => {
    if (!source) return
    untrack(() => {
      handleSearch()
    })
  })
</script>

{#if source}
  <Songlist sId={source.sId} {list} {listInfo} onreload={() => handleSearch()} />
{/if}
