import { LIST_IDS } from '@any-listen/common/constants'
import { derived, get, readable } from 'svelte/store'

import { i18n, languageChangeEvent } from '@/plugins/i18n'

import { getSubUserLists } from './store/actions'
import { musicLibraryEvent } from './store/event'
import { musicLibraryState } from './store/state'

const getDefaultLists = () => {
  return [
    { ...musicLibraryState.loveList, name: i18n.t('list_name__love') },
    { ...musicLibraryState.defaultList, name: i18n.t('list_name__default') },
  ] as AnyListen.List.MyListInfo[]
}
// const getMyLists = () => {
//   return [
//     ...getDefaultLists(),
//     ...(musicLibraryState.userLists ?? []),
//   ] as AnyListen.List.MyListInfo[]
// }

export const defaultLists = readable(getDefaultLists(), (set) => {
  const handleUpdate = () => {
    set(getDefaultLists())
  }
  handleUpdate()
  const unsub = musicLibraryEvent.on('listChanged', (ids) => {
    if (ids.includes(LIST_IDS.DEFAULT) || ids.includes(LIST_IDS.LOVE)) {
      handleUpdate()
    }
  })
  const unsub2 = languageChangeEvent.on(handleUpdate)

  return function stop() {
    unsub()
    unsub2()
  }
})

export const allUserLists = readable(musicLibraryState.userLists, (set) => {
  const handleUpdate = () => {
    set([...musicLibraryState.userLists])
  }
  handleUpdate()
  const unsub = musicLibraryEvent.on('listSubListChanged', handleUpdate)

  return function stop() {
    unsub()
  }
})

// export const useUserLists = () => {
//   let val = $state<AnyListen.List.MyListInfo[]>(getMyLists())
//   const handleUpdate = () => {
//     val = getMyLists()
//   }
//   const unsub = musicLibraryEvent.on('listChanged', handleUpdate)
//   const unsub2 = onSettingChanged('common.langId', handleUpdate)

//   $effect(() => {
//     return () => {
//       unsub()
//       unsub2()
//     }
//   })
//   return {
//     get val() {
//       return val
//     },
//   }
// }
export const userListsAll = derived([defaultLists, allUserLists], ([defaultLists, allUserLists]) => {
  return [...defaultLists, { ...musicLibraryState.lastPlayList, name: i18n.t('list_name__last_play') }, ...allUserLists]
})

export const userListInited = readable(musicLibraryState.userListInited, (set) => {
  const handleUpdate = () => {
    set(musicLibraryState.userListInited)
  }
  handleUpdate()
  const unsub = musicLibraryEvent.on('userListInited', handleUpdate)

  return function stop() {
    unsub()
  }
})

export const getUserListsAll = () => get(userListsAll)

// export const useUserListsAll = () => {
//   let userLists = useUserLists()
//   let val = $derived([...userLists.val, { ...musicLibraryState.lastPlayList, name: i18n.t('list_name__last_play') }])
//   return {
//     get val() {
//       return val
//     },
//   }
// }

export const useUserList = (parentId: AnyListen.List.ParentId) => {
  let val = $state(getSubUserLists(parentId))
  const handleUpdate = (ids: AnyListen.List.ParentId[]) => {
    if (!ids.includes(parentId)) return
    val = getSubUserLists(parentId)
  }
  $effect(() => {
    val = getSubUserLists(parentId)
    const unsub = musicLibraryEvent.on('listSubListChanged', handleUpdate)
    return () => {
      unsub()
    }
  })
  return {
    get val() {
      return val
    },
  }
}

export const useFetchingListStatus = (id = '') => {
  let val = $state(musicLibraryState.fetchingListStatus[id])
  $effect(() => {
    val = musicLibraryState.fetchingListStatus[id]
    return musicLibraryEvent.on('fetchingListStatusUpdated', (_id) => {
      if (id != _id) return
      val = musicLibraryState.fetchingListStatus[_id]
    })
  })
  return {
    get val() {
      return val
    },
  }
}
