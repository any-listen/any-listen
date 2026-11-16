<script lang="ts">
  import { buildSourceKey, getData } from '@/modules/resource/topSongs/list/actions'
  import type { SourceType } from '../../shared.svelte'
  import { untrack } from 'svelte'
  import Songlist from './Songlist.svelte'

  let { source }: { source?: SourceType } = $props()
  let list = $state.raw<AnyListen.Resource.TopSongsItem[]>([])
  let listInfo = $state<{
    loading: boolean
    error: boolean
  }>({ loading: false, error: false })

  const handleSearch = () => {
    let extId = source!.extensionId
    let sourceId = source!.id
    const searchId = buildSourceKey(extId, sourceId)
    listInfo.loading = true
    void getData(extId, sourceId)
      .then((_list) => {
        if (searchId != buildSourceKey(extId, sourceId)) {
          return
        }
        listInfo.error = false
        list = _list
        console.log(_list)
      })
      .catch((err) => {
        console.log(err)
        if (searchId != buildSourceKey(extId, sourceId)) {
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
    untrack(() => {
      handleSearch()
    })
  })
</script>

{#if source}
  <Songlist sId={source.sId} {list} {listInfo} onreload={() => handleSearch()} />
{/if}
