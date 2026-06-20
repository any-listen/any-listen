import { parseRequestKey } from '@/modules/resource/search/music/actions'
import { buildQueryParams, getLocation, push } from '@/plugins/routes'
import { executeCommand as executeCommandRemote } from '@/shared/ipc/extension'
import { getItem, LOCAL_STORE_KEYS, setItem } from '@/shared/localStore'
import { searchTypeMap } from '@/views/Online/Search/shared.svelte'
import { getSourceId, urlParamKeyMap, type ViewType } from '@/views/Online/shared.svelte'

import { appEvent, hiddenCommonCommands, localCommands } from './event'
// import { parseUrlParams } from '@/shared'
// import * as commit from './commit'

// export const setInited = (init: boolean) => {
//   commit.setInited(init)
// }

// export const setLogin = (show: boolean) => {
//   commit.setLogin(show)
// }

export const sendConnected = () => {
  appEvent.connected()
}

export const sendDesconnected = () => {
  appEvent.desconnected()
}

export const sendConnectFailed = (message: string) => {
  appEvent.connectFailed(message)
}

export const sendRelease = () => {
  appEvent.release()
}

export const scrollListTo = (listId: string, source: AnyListen.Player.SourceType, musicInfo: AnyListen.Music.MusicInfo) => {
  let urlParams: {
    base: string
    path: string
  }
  if (source === 'songlist') {
    urlParams = {
      base: '/online',
      path: `/online/songlist?${urlParamKeyMap.source}=${encodeURIComponent((musicInfo as AnyListen.Music.MusicInfoOnline).meta.source)}&id=${encodeURIComponent(listId)}&mid=${encodeURIComponent(musicInfo.id)}`,
    }
  } else if (source === 'topSongs') {
    urlParams = {
      base: '/online',
      path: `/online/topSongs?${urlParamKeyMap.source}=${encodeURIComponent((musicInfo as AnyListen.Music.MusicInfoOnline).meta.source)}&id=${encodeURIComponent(listId)}&mid=${encodeURIComponent(musicInfo.id)}`,
    }
  } else if (source === 'search') {
    const searchInfo = parseRequestKey(listId)
    if (!searchInfo) return
    const params: Record<string, string> = {}
    params[urlParamKeyMap.type] = 'search' satisfies ViewType
    params[urlParamKeyMap.source] = getSourceId({ extensionId: searchInfo.extId, id: searchInfo.source, name: '' })
    params[urlParamKeyMap.queryType] = searchTypeMap.musicSearch
    params[urlParamKeyMap.query] = searchInfo.text
    if (searchInfo.page) params[urlParamKeyMap.page] = searchInfo.page.toString()
    params.mid = musicInfo.id
    urlParams = {
      base: '/online',
      path: `/online?${buildQueryParams(params)}`,
    }
    const loc = getLocation()
    if (loc.rawLocation == urlParams.path) {
      appEvent.scrollListTo(listId, musicInfo.id)
    } else {
      void push(urlParams.path)
    }
    return
  } else {
    urlParams = {
      base: '/library',
      path: `/library?id=${encodeURIComponent(listId)}&mid=${encodeURIComponent(musicInfo.id)}`,
    }
  }
  const loc = getLocation()
  if (loc.location.startsWith(urlParams.base) && loc.query.id == listId) {
    appEvent.scrollListTo(listId, musicInfo.id)
  } else {
    void push(urlParams.path)
  }
}

export {
  setFullScreen,
  setMachineId,
  setRootOffset,
  // setInited,
  // setShowLogin,
  setWorkerInitPromise,
} from './commit'

export { getLoginDevices, getMachineId, getSetting, removeLoginDevice, sendInitedEvent, setSetting } from '@/shared/ipc/app'

// name: i18n.t('command.local.run')
let lastUsedCommands: string[]
export const getLastUsedCommands = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  lastUsedCommands ??= JSON.parse(getItem(LOCAL_STORE_KEYS.lastUsedCommands) || '[]')
  return lastUsedCommands
}
export const setLastUsedCommand = (command: string) => {
  const commands = getLastUsedCommands()
  const index = commands.indexOf(command)
  if (index !== -1) {
    commands.splice(index, 1)
  }
  commands.unshift(command)
  if (commands.length > 20) {
    commands.pop()
  }
  lastUsedCommands = commands
  setItem(LOCAL_STORE_KEYS.lastUsedCommands, JSON.stringify(commands))
}

export { localCommands }
const allCommands = [...localCommands, ...hiddenCommonCommands]
export const executeCommand = async (command: string, ...args: any[]): Promise<unknown> => {
  if (allCommands.includes(command as (typeof localCommands)[number])) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    appEvent.executeCommand(command as (typeof localCommands)[number], ...args)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return executeCommandRemote(command, ...args)
  }
}

export const executeLocalCommand = (cmd: (typeof localCommands)[number], ...args: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  appEvent.executeCommand(cmd, ...args)
}
