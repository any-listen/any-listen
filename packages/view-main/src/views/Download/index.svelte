<script lang="ts">
  import { onMount } from 'svelte'
  import { sizeFormate } from '@any-listen/common/utils'

  import Btn from '@/components/base/Btn.svelte'
  import Checkbox from '@/components/base/Checkbox.svelte'
  import Menu, { type MenuList } from '@/components/base/Menu.svelte'
  import Tab from '@/components/base/Tab.svelte'
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import { showMusicAddModal } from '@/components/apis/musicAddModal'
  import { copyName } from '@/components/common/MusicList/List/action'
  import { useSelect } from '@/components/common/MusicList/List/useSelect.svelte'
  import { locateDownload, pauseDownloads, playDownloads, playDownloadsLater, removeDownloads, runDownloadAction, startDownloads } from '@/modules/download/actions'
  import { downloadState, refreshDownloadList } from '@/modules/download/store.svelte'
  import { playMusicInfo } from '@/modules/player/reactive.svelte'
  import { toOnlineSearch } from '@/modules/resource/actions'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import { t } from '@/plugins/i18n'
  import { push } from '@/plugins/routes'
  import { getDownloadMusicInfos } from '@/shared/ipc/download'

  type TabId = 'all' | 'running' | 'paused' | 'error' | 'finished'
  type Action = 'start' | 'pause' | 'remove' | 'play' | 'later' | 'file' | 'add' | 'search' | 'copy'
  let tab = $state<TabId>('all')
  let shift = $state(false)
  let menuVisible = $state(false)
  let menuLocation = $state({ x: 0, y: 0 })
  let menuItem = $state<AnyListen.Download.ListItem | undefined>()
  const height = useListItemHeight(3.2)
  const tabs = $derived([
    { id: 'all', label: $t('download.tab.all') },
    { id: 'running', label: $t('download.tab.running') },
    { id: 'paused', label: $t('download.tab.paused') },
    { id: 'error', label: $t('download.tab.error') },
    { id: 'finished', label: $t('download.tab.finished') },
  ])
  const list = $derived(downloadState.list.filter((item) => {
    switch (tab) {
      case 'running': return item.status === 'run' || item.status === 'waiting'
      case 'paused': return item.status === 'pause'
      case 'error': return item.status === 'error'
      case 'finished': return item.status === 'completed'
      default: return true
    }
  }))
  const select = useSelect<AnyListen.Download.ListItem>({ get list() { return list }, get isShiftDown() { return shift }, keyname: 'id' })
  const selected = $derived(select.list)
  const completed = $derived(selected.every((item) => item.status === 'completed'))
  const operable = $derived(downloadState.connected && !downloadState.loading)
  const menus = $derived.by((): MenuList<Action> => {
    const items = selected.some((item) => item.id === menuItem?.id) ? selected : menuItem ? [menuItem] : []
    const finished = items.length > 0 && items.every((item) => item.status === 'completed')
    return [
      { action: 'play', label: $t('user_list_music_menu__play'), disabled: !finished },
      { action: 'later', label: $t('user_list_music_menu__play_later'), disabled: !finished },
      null,
      { action: 'start', label: $t('download.start'), disabled: !items.some((item) => item.status === 'pause' || item.status === 'error') },
      { action: 'pause', label: $t('download.pause'), disabled: !items.some((item) => item.status === 'run' || item.status === 'waiting') },
      { action: 'file', label: $t('download.locate') },
      { action: 'add', label: $t('user_list_music_menu__add_to') },
      { action: 'search', label: $t('download.search') },
      { action: 'copy', label: $t('user_list_music_menu__copy_name') },
      null,
      { action: 'remove', label: $t('download.remove') },
    ]
  })
  const act = async (action: Action, items: AnyListen.Download.ListItem[]) => {
    if (!operable || !items.length) return
    const ids = items.map((item) => item.id)
    switch (action) {
      case 'start': await startDownloads(ids); break
      case 'pause': await pauseDownloads(ids); break
      case 'remove': await removeDownloads(ids); select.clearSelect(); break
      case 'play': await playDownloads(ids); break
      case 'later': await playDownloadsLater(ids); break
      case 'file': await locateDownload(items[0]); break
      case 'add': await runDownloadAction(async () => showMusicAddModal(false, '', items.every((item) => item.status === 'completed')
        ? await getDownloadMusicInfos(ids) : items.map((item) => item.metadata.musicInfo))); break
      case 'search': await toOnlineSearch(`${items[0].metadata.musicInfo.name} ${items[0].metadata.musicInfo.singer}`); break
      case 'copy': copyName(items[0].metadata.musicInfo); break
    }
  }
  const primary = (item: AnyListen.Download.ListItem) => {
    if (item.status === 'completed') {
      const all = downloadState.list.filter((task) => task.status === 'completed')
      return playDownloads(all.map((task) => task.id), all.findIndex((task) => task.id === item.id))
    }
    return act(item.status === 'run' || item.status === 'waiting' ? 'pause' : 'start', [item])
  }
  const context = (event: MouseEvent, item: AnyListen.Download.ListItem) => {
    event.preventDefault()
    menuItem = item
    menuLocation = { x: event.pageX, y: event.pageY }
    menuVisible = true
  }
  const selectAll = () => select.override(selected.length === list.length ? [] : [...list])
  onMount(() => { void refreshDownloadList() })
</script>

<svelte:window onkeydown={(event) => { shift = event.shiftKey }} onkeyup={(event) => { shift = event.shiftKey }} onblur={() => { shift = false }} />

<div class="view-container download-view">
  <header>
    <Tab list={tabs} itemkey="id" itemlabel="label" bind:value={tab} onchange={() => select.clearSelect()} />
    <Btn min onclick={() => push('/settings', { type: 'app', id: 'download' })}>{$t('download.settings')}</Btn>
  </header>
  <div class="toolbar">
    <Checkbox id="download-select-all" checked={list.length > 0 && selected.length === list.length} disabled={!list.length} label={$t('download.select_all')} onchange={selectAll} />
    <span>{$t('download.selected_count', { count: selected.length })}</span>
    <Btn min disabled={!operable || !selected.some((item) => item.status === 'error' || item.status === 'pause')} onclick={() => act('start', selected)}>{$t('download.start')}</Btn>
    <Btn min disabled={!operable || !selected.some((item) => item.status === 'run' || item.status === 'waiting')} onclick={() => act('pause', selected)}>{$t('download.pause')}</Btn>
    <Btn min disabled={!operable || !selected.length || !completed} onclick={() => act('play', selected)}>{$t('user_list_music_menu__play')}</Btn>
    <Btn min disabled={!operable || !selected.length} onclick={() => act('remove', selected)}>{$t('download.remove')}</Btn>
  </div>
  {#if !downloadState.connected}<p class="notice" role="status">{$t('download.disconnected')}</p>{/if}
  {#if downloadState.error}
    <p class="notice" role="alert">{downloadState.error}</p>
    <Btn min disabled={!downloadState.connected} onclick={refreshDownloadList}>{$t('download.refresh')}</Btn>
  {/if}
  <div class="table-header">
    <span>#</span><span>{$t('download.song')}</span><span>{$t('download.progress')}</span><span>{$t('download.task_status')}</span><span>{$t('download.quality')}</span><span>{$t('download.actions')}</span>
  </div>
  <div class="tasks">
    {#if list.length}
      <VirtualizedList list={list} keyname="id" itemheight={Math.max(48, height.val)} containerclass="download-list">
        {#snippet row(item, index)}
          <div class="task-row" class:selected={selected.some((task) => task.id === item.id)} class:playing={$playMusicInfo?.musicInfo.isLocal && $playMusicInfo.musicInfo.meta.filePath === item.metadata.filePath}
            role="option" tabindex="0" aria-selected={selected.some((task) => task.id === item.id)}
            onclick={() => select.handleSelect(index)} ondblclick={() => primary(item)} oncontextmenu={(event) => context(event, item)}
            onkeydown={(event) => {
              if (event.target !== event.currentTarget) return
              if (event.key === 'Enter') { event.preventDefault(); void primary(item) }
              else if (event.key === ' ') { event.preventDefault(); select.handleSelect(index) }
              else if (event.key === 'Escape') select.clearSelect()
              else if (event.key === 'Delete') { event.preventDefault(); void act('remove', selected.length ? selected : [item]) }
              else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') { event.preventDefault(); selectAll() }
            }}>
            <span>{index + 1}</span>
            <span class="song" title={`${item.metadata.musicInfo.name} — ${item.metadata.musicInfo.singer}`}><strong>{item.metadata.musicInfo.name}</strong><small>{item.metadata.musicInfo.singer}</small></span>
            <span class="progress" title={`${sizeFormate(item.downloaded)} / ${sizeFormate(item.total)}`}>
              {item.progress < 0 ? '—' : `${item.progress}%`}{item.status === 'run' && item.speed ? ` · ${item.speed}/s` : ''}
            </span>
            <span class="status" class:warning={item.status === 'completed' && !!item.statusText} title={item.statusText || item.metadata.filePath}>
              {$t(`download.status.${item.status}`)}{item.statusText ? ` · ${item.statusText.replaceAll('\n', '; ')}` : ''}
            </span>
            <span>{item.metadata.quality === 'flac24bit' ? 'FLAC Hi-Res' : item.metadata.quality.toUpperCase()}</span>
            <div class="buttons" role="presentation" onclick={(event) => event.stopPropagation()} ondblclick={(event) => event.stopPropagation()}>
              {#if item.status === 'completed'}
                <Btn min disabled={!operable} onclick={() => primary(item)}>{$t('user_list_music_menu__play')}</Btn>
              {:else if item.status === 'run' || item.status === 'waiting'}
                <Btn min disabled={!operable} onclick={() => act('pause', [item])}>{$t('download.pause')}</Btn>
              {:else}
                <Btn min disabled={!operable} onclick={() => act('start', [item])}>{$t('download.start')}</Btn>
              {/if}
              <Btn min disabled={!operable} onclick={() => act('file', [item])}>{$t('download.locate')}</Btn>
              <Btn min disabled={!operable} onclick={() => act('remove', [item])}>{$t('download.remove')}</Btn>
            </div>
          </div>
        {/snippet}
      </VirtualizedList>
    {:else}
      <p class="empty" role="status">{$t(downloadState.loading ? 'download.loading' : 'download.empty')}</p>
    {/if}
  </div>
  <Menu bind:visible={menuVisible} location={menuLocation} {menus} onclick={(menu) => {
    menuVisible = false
    void act(menu.action, selected.some((item) => item.id === menuItem?.id) ? selected : menuItem ? [menuItem] : [])
  }} />
</div>

<style lang="less">
  .download-view { display: flex; flex-flow: column; min-height: 0; overflow: hidden; padding: 12px 16px; }
  header { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 12px; }
  .toolbar { display: flex; flex: none; align-items: center; flex-wrap: wrap; gap: 10px; padding: 12px 0; font-size: 12px; }
  .table-header, .task-row { display: grid; grid-template-columns: 4% minmax(0, 1fr) 18% 22% 10% 170px; gap: 10px; align-items: center; padding: 0 8px; }
  .table-header { flex: none; height: 36px; font-size: 12px; color: var(--color-font-label); }
  .tasks { flex: auto; min-height: 0; }
  .task-row { height: 100%; border-radius: @radius-border; font-size: 12px; outline: none; cursor: default; }
  .task-row:hover, .task-row:focus-visible { background: var(--color-primary-light-400-alpha-700); }
  .task-row.selected { background: var(--color-primary-light-300-alpha-700); }
  .task-row.playing { color: var(--color-button-font); }
  .song { display: flex; flex-flow: column; gap: 4px; overflow: hidden; }
  strong, small, .status, .progress { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  strong { font-weight: normal; }
  small { color: var(--color-font-label); }
  .buttons { display: flex; gap: 3px; }
  .warning { color: var(--color-font-label); }
  .empty { display: flex; height: 100%; justify-content: center; align-items: center; color: var(--color-font-label); }
  .notice { flex: none; padding: 8px 0; font-size: 12px; }
  @media (max-width: 800px) { .table-header, .task-row { grid-template-columns: 3% minmax(0, 1fr) 14% 16% 9% 150px; gap: 5px; } }
</style>
