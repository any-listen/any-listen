<script lang="ts">
  import { tick } from 'svelte'
  import { t } from '@/plugins/i18n'
  import Menu, { type MenuList } from '@/components/base/Menu.svelte'
  import { copyName, dislikeMusic, locateMusic, playMusic, playMusicLater, removeMusic } from './action'
  import { hasDislike } from '@/modules/dislikeList/store/actions'
  import type { MenuSelectInfo } from '../type'
  import { showMusicAddModal } from '@/components/apis/musicAddModal'
  let {
    local,
    onhide,
  }: {
    local: boolean
    onhide?: () => void
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
    const newMenu: Array<MenuList<MenuType>[number] | false> = [
      { action: 'play', label: $t('user_list_music_menu__play') },
      { action: 'playLater', label: $t('user_list_music_menu__play_later') },
      // { action: 'download', label: $t('user_list_music_menu__download') },
      { action: 'addTo', label: $t('user_list_music_menu__add_to') },
      local && { action: 'moveTo', label: $t('user_list_music_menu__move_to') },
      // { action: 'sort', label: $t('user_list_music_menu__sort') },
      null,
      { action: 'copyName', label: $t('user_list_music_menu__copy_name') },
      // { action: 'detail', label: $t('user_list_music_menu__detail') },
      null,
      { action: 'dislike', disabled: dislike, label: $t('user_list_music_menu__dislike') },
      local && { action: 'remove', label: $t('user_list_music_menu__remove') },
    ]
    if (import.meta.env.VITE_IS_DESKTOP) {
      if (selectInfo.musicInfo.isLocal) {
        newMenu.splice(6, 0, { action: 'locate', label: $t('user_list_music_menu__locate') })
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
        void playMusic(selectInfo.listId, selectInfo.musicInfo)
        break
      case 'playLater':
        void playMusicLater(selectInfo.listId, selectInfo.musicInfo, selectInfo.selectedList, selectInfo.onRemoveAllSelected)
        break
      case 'addTo':
        showMusicAddModal(
          false,
          selectInfo.listId,
          selectInfo.selectedList.length ? selectInfo.selectedList : [selectInfo.musicInfo]
        )
        break
      case 'moveTo':
        showMusicAddModal(
          true,
          selectInfo.listId,
          selectInfo.selectedList.length ? selectInfo.selectedList : [selectInfo.musicInfo]
        )
        break
      case 'copyName':
        copyName(selectInfo.musicInfo)
        break
      case 'locate':
        locateMusic(selectInfo.musicInfo as AnyListen.Music.MusicInfoLocal)
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
