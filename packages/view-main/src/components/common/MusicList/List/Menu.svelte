<script lang="ts">
  import { tick } from 'svelte'
  import { t } from '@/plugins/i18n'
  import Menu, { type MenuList } from '@/components/base/Menu.svelte'
  import { copyName, dislikeMusic, locateMusic, playMusicLater, removeMusic, updateMusicPosition } from './action'
  import { hasDislike } from '@/modules/dislikeList/store/actions'
  import type { MenuSelectInfo } from '../type'
  import { showMusicAddModal } from '@/components/apis/musicAddModal'
  import { showMusicCommentModal } from '@/components/apis/musicCommentModal'
  import { appState } from '@/modules/app/store/state'
  import { showMusicToggleModal } from './components/MusicToggleModal'
  import { showMusicSortModal } from './components/MusicSortModal'

  type ListType = 'default' | AnyListen.List.UserListType
  let {
    source,
    type,
    deviceid,
    onplay,
    onhide,
    oncancelmulti,
  }: {
    source: AnyListen.Player.SourceType
    type: ListType
    deviceid: string | null
    onplay: (musicInfo: AnyListen.Music.MusicInfo) => Promise<void>
    onhide?: () => void
    oncancelmulti: () => void
  } = $props()

  type MenuType =
    | 'play'
    | 'download'
    | 'playLater'
    | 'addTo'
    | 'moveTo'
    | 'detail'
    | 'sort'
    | 'toggleSource'
    | 'comment'
    | 'copyName'
    | 'sourceDetail'
    | 'search'
    | 'locate'
    | 'dislike'
    | 'remove'
  let menuVisible = $state.raw(false)
  let menuLocation = $state.raw({ x: 0, y: 0 })
  let menus = $state.raw<MenuList<MenuType>>([])
  let selectInfo: MenuSelectInfo

  const setMenu = () => {
    // let sourceDetail = !!musicSdk[musicInfo.source]?.getMusicDetailPageUrl
    // let download = assertApiSupport(musicInfo.source) && musicInfo.source != 'local'
    let dislike = hasDislike(selectInfo.musicInfo)
    const local = source === 'local'
    const localList = deviceid != null
    const notLocalList = localList && deviceid != appState.machineId
    const notLocalMusic = notLocalList || selectInfo.musicInfo.meta.deviceId != appState.machineId
    const newMenu: Array<MenuList<MenuType>[number] | false> = [
      { action: 'play', label: $t('user_list_music_menu__play') },
      { action: 'playLater', label: $t('user_list_music_menu__play_later') },
      // { action: 'download', label: $t('user_list_music_menu__download') },
      { action: 'addTo', label: $t('user_list_music_menu__add_to') },
      local && !localList && { action: 'moveTo', label: $t('user_list_music_menu__move_to') },
      local && { action: 'sort', label: $t('user_list_music_menu__sort') },
      null,
      { action: 'comment', label: $t('user_list_music_menu__comment') },
      { action: 'copyName', label: $t('user_list_music_menu__copy_name') },
      // { action: 'detail', label: $t('user_list_music_menu__detail') },
      ...(local && !(['local', 'remote'] as ListType[]).includes(type)
        ? ([null, { action: 'toggleSource', label: $t('user_list_music_menu__toggle_source') }] satisfies MenuList<MenuType>)
        : []),
      null,
      { action: 'dislike', disabled: dislike, label: $t('user_list_music_menu__dislike') },
      local && { action: 'remove', disabled: notLocalList, label: $t('user_list_music_menu__remove') },
    ]
    if (import.meta.env.VITE_IS_DESKTOP) {
      if (selectInfo.musicInfo.isLocal) {
        newMenu.splice(6, 0, { action: 'locate', disabled: notLocalMusic, label: $t('user_list_music_menu__locate') })
      }
    }
    menus = newMenu.filter((m) => m !== false) as MenuList<MenuType>
  }

  export const show = async (_selectInfo: MenuSelectInfo, position: { x: number; y: number }) => {
    selectInfo = _selectInfo
    menuLocation = position
    setMenu()
    await tick()
    menuVisible = true
  }

  const handleClick = (menu: NonNullable<(typeof menus)[number]>) => {
    switch (menu.action) {
      case 'play':
        void onplay?.(selectInfo.musicInfo)
        break
      case 'playLater':
        void playMusicLater(
          selectInfo.listId,
          selectInfo.musicInfo,
          selectInfo.selectedList,
          source,
          selectInfo.onRemoveAllSelected
        )
        break
      case 'addTo':
        void showMusicAddModal(
          false,
          selectInfo.listId,
          selectInfo.selectedList.length ? selectInfo.selectedList : [selectInfo.musicInfo]
        )
        break
      case 'moveTo':
        void showMusicAddModal(
          true,
          selectInfo.listId,
          selectInfo.selectedList.length ? selectInfo.selectedList : [selectInfo.musicInfo]
        )
        break
      case 'sort': {
        const mInfo = selectInfo.musicInfo
        const selectedLength = selectInfo.selectedList.length
        void showMusicSortModal(mInfo, selectedLength).then((num) => {
          if (num == null) return
          if (selectInfo.musicInfo !== mInfo || selectInfo.selectedList.length !== selectedLength) return
          const musics = selectInfo.selectedList.length ? selectInfo.selectedList : [selectInfo.musicInfo]
          updateMusicPosition(
            selectInfo.listId,
            num,
            musics.map((m) => m.id)
          ).then(() => {
            oncancelmulti()
          })
        })
        break
      }
      case 'comment':
        void showMusicCommentModal(selectInfo.musicInfo)
        break
      case 'copyName':
        copyName(selectInfo.musicInfo)
        break
      case 'locate':
        locateMusic(selectInfo.musicInfo as AnyListen.Music.MusicInfoLocal)
        break
      case 'toggleSource':
        void showMusicToggleModal(selectInfo.musicInfo, selectInfo.listId)
        break
      case 'dislike':
        void dislikeMusic(selectInfo.musicInfo)
        break
      case 'remove':
        void removeMusic(selectInfo.listId, selectInfo.musicInfo, selectInfo.selectedList, selectInfo.onRemoveAllSelected)
        break

      default:
        break
    }
    menuVisible = false
  }
</script>

<Menu bind:visible={menuVisible} {menus} location={menuLocation} onclick={handleClick} {onhide} />
