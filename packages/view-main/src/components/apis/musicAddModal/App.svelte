<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import { t } from '@/plugins/i18n'
  import { defaultLists, useUserList } from '@/modules/musicLibrary/reactive.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import ListItem from './ListItem.svelte'
  import { getMusicExistListIds } from '@/modules/musicLibrary/actions'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import { addMusic, moveMusic } from './shared'
  import { GENERAL_LIST_TYPES } from '@/shared/constants'

  let {
    onafterleave,
  }: {
    onafterleave: () => void
  } = $props()

  const listItemHeight = useListItemHeight(3.2)
  const picStyle = $derived(`height:${listItemHeight.val * 0.8}px;width:${listItemHeight.val * 0.8}px;`)

  let visible = $state(false)
  let isMove = $state(false)
  let listId = ''
  let musicInfos = $state.raw<AnyListen.Music.MusicInfo[]>([])
  let existListIds = $state.raw<string[]>([])
  // let targetId: string | undefined
  let title = $derived(
    musicInfos.length > 1
      ? isMove
        ? $t('music_add_modal__multiple_move_title', { num: musicInfos.length })
        : $t('music_add_modal__multiple_add_title', { num: musicInfos.length })
      : isMove
        ? $t('music_add_modal__move_title', { name: musicInfos[0].name })
        : $t('music_add_modal__add_title', { name: musicInfos[0].name })
  )

  const userLists = useUserList(null)
  const lists = $derived(
    [...$defaultLists, ...userLists.val].filter((l) => l.id != listId && GENERAL_LIST_TYPES.includes(l.type))
  )

  const closeModal = () => {
    visible = false
  }

  const handleClick = (toId: string) => {
    // await createUserList(listType, listName, targetId)
    if (isMove) {
      void moveMusic(listId, toId, musicInfos)
    } else {
      void addMusic(toId, musicInfos)
    }
    closeModal()
  }

  export const show = (_isMove: boolean, _listId: string, _musicInfos: AnyListen.Music.MusicInfo[]) => {
    isMove = _isMove
    listId = _listId
    musicInfos = _musicInfos
    existListIds = []
    if (musicInfos.length == 1) {
      void getMusicExistListIds(musicInfos[0].id).then((ids) => {
        existListIds = ids
      })
    }
    visible = true
  }

  // $effect(() => {
  //   if (!visible) return
  // })
</script>

<Modal bind:visible teleport="#root" width="65%" maxwidth="60rem" {onafterleave}>
  <main class="main">
    <div class="header">
      <h2>{title}</h2>
    </div>
    <div class="content">
      <div class="list" {@attach verticalScrollbar({ offset: '0' })}>
        {#each lists as list (list.id)}
          <ListItem
            picstyle={picStyle}
            listinfo={list}
            onclick={() => {
              handleClick(list.id)
            }}
            disabled={existListIds.includes(list.id)}
          />
        {/each}
      </div>
    </div>
    <!-- <div class="footer">
      <Btn onclick={handleComfirm}>{$t('btn_confirm')}</Btn>
    </div> -->
  </main>
</Modal>

<style lang="less">
  .main {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    // width: 560px;
    min-height: 0;
    padding: 0 10px;
    // max-height: 100%;
    // overflow: hidden;
  }
  .header {
    flex: none;
    padding: 10px;
    text-align: center;
    h2 {
      font-size: 14px;
      color: var(--color-font);
      word-break: break-all;
    }
  }

  .content {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-height: 0;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 6px;
    align-content: start;
    max-height: 100%;
    // gap: 10px;
    // font-size: 14px;
    // color: var(--color-font-label);
    // padding: 10px 0 8px;
  }

  // .footer {
  //   flex: none;
  //   margin: 20px 0 15px auto;
  //   display: flex;
  //   flex-direction: row;
  //   gap: 10px;

  //   :global(.btn) {
  //     min-width: 70px;
  //   }
  // }
</style>
