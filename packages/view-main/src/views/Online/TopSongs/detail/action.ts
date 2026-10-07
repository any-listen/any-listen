import { showNotify } from '@/components/apis/notify'
import { addListMusics, createUserList } from '@/modules/musicLibrary/store/actions'
import { musicLibraryState } from '@/modules/musicLibrary/store/state'
import { topSongsDetailAll } from '@/modules/resource/topSongs/detail/actions'
import { i18n } from '@/plugins/i18n'

export const saveList = async (listInfo: {
  extensionId: string
  source: string
  id: string
  date: string
  name: string
  pic?: string
  desc?: string
}) => {
  const userLists = musicLibraryState.userLists
  const targetList = userLists.find((l) => l.type === 'online' && l.meta.syncId === listInfo.id)
  if (targetList) {
    showNotify(i18n.t('online.songlist.detail.save_exist_tip', { name: listInfo.name }))
    return
  }
  await createUserList(musicLibraryState.userLists.length, {
    id: '',
    type: 'online',
    name: listInfo.name,
    parentId: null,
    meta: {
      extensionId: listInfo.extensionId,
      source: listInfo.source,
      sourceType: 'topSongs',
      pic: listInfo.pic ?? '',
      desc: listInfo.desc ?? '',
      syncId: listInfo.id,
      autoSync: false,
      date: listInfo.date,
      createTime: 0,
      updateTime: 0,
      playCount: 0,
      posTime: 0,
      songCount: 0,
      syncTime: 0,
    },
  })
  showNotify(i18n.t('music_add_modal_add_success'))
}

export const saveListAsGeneral = async (listInfo: {
  extensionId: string
  source: string
  id: string
  date: string
  name: string
  pic?: string
  desc?: string
}) => {
  const listId = await createUserList(musicLibraryState.userLists.length, {
    id: '',
    name: listInfo.name,
    parentId: null,
    type: 'general',
    meta: {
      createTime: 0,
      updateTime: 0,
      desc: listInfo.desc ?? '',
      playCount: 0,
      posTime: 0,
      pic: listInfo.pic ?? '',
      songCount: 0,
    },
  })
  const allMusics = await topSongsDetailAll(listInfo.extensionId, listInfo.source, listInfo.id, listInfo.date)
  await addListMusics(listId, allMusics)
  showNotify(i18n.t('music_add_modal_add_success'))
}
