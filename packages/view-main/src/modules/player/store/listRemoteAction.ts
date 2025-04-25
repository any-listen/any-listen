import { onPlayListAction, sendPlayListAction } from '@/shared/ipc/player'
import * as commit from './commit'

/**
 * 覆盖列表
 * @param data
 */
export const setPlayListMusic = async (data: AnyListen.IPCPlayer.PlayerActionSet) => {
  await sendPlayListAction({ action: 'set', data })
}

/**
 * 添加歌曲
 * @param data
 */
export const addPlayListMusic = async (data: AnyListen.IPCPlayer.PlayerActionAdd) => {
  await sendPlayListAction({ action: 'add', data })
}

/**
 * 移除歌曲
 * @param data
 */
export const removePlayListMusic = async (data: AnyListen.IPCPlayer.PlayerActionRemove) => {
  await sendPlayListAction({ action: 'remove', data })
}

/**
 * 更新歌曲信息
 * @param data
 */
export const updatePlayListMusic = async (data: AnyListen.IPCPlayer.PlayerActionUpdate) => {
  await sendPlayListAction({ action: 'update', data })
}

/**
 * 设置歌曲已播放
 * @param data
 */
export const setPlayListMusicPlayed = async (data: AnyListen.IPCPlayer.PlayerActionPlayed) => {
  commit.updatePlayListMusicPlayed(true, data)
  await sendPlayListAction({ action: 'played', data })
}

/**
 * 设置歌曲未播放
 * @param data
 */
export const setPlayListMusicUnplayed = async (data: AnyListen.IPCPlayer.PlayerActionUnplayed) => {
  commit.updatePlayListMusicPlayed(false, data)
  await sendPlayListAction({ action: 'unplayed', data })
}

/**
 * 设置全部歌曲未播放
 * @param data
 */
export const setPlayListMusicUnplayedAll = async () => {
  commit.updatePlayListMusicPlayedAll(false)
  await sendPlayListAction({ action: 'unplayedAll' })
}

/**
 * 更新歌曲位置
 * @param data
 */
export const updatePlayListMusicPos = async (data: AnyListen.IPCPlayer.PlayerActionPosUpdate) => {
  await sendPlayListAction({ action: 'posUpdate', data })
}

export const registerRemoteListAction = () => {
  const set = (info: AnyListen.IPCPlayer.PlayerActionSet) => {
    commit.setPlayListMusic(info.list)
    commit.setPlayListId(info.listId, info.isOnline)
  }
  const add = (data: AnyListen.IPCPlayer.PlayerActionAdd) => {
    commit.addPlayListMusic(data.pos, data.musics)
  }
  const update = (data: AnyListen.IPCPlayer.PlayerActionUpdate) => {
    commit.updatePlayListMusic(data)
  }
  const remove = (data: AnyListen.IPCPlayer.PlayerActionRemove) => {
    commit.removePlayListMusic(data)
  }
  const posUpdate = (data: AnyListen.IPCPlayer.PlayerActionPosUpdate) => {
    commit.updatePlayListMusicPosition(data.pos, data.musics)
  }
  const played = (data: AnyListen.IPCPlayer.PlayerActionPlayed) => {
    commit.updatePlayListMusicPlayed(true, data)
  }
  const unplayed = (data: AnyListen.IPCPlayer.PlayerActionUnplayed) => {
    commit.updatePlayListMusicPlayed(false, data)
  }
  const unplayedAll = () => {
    commit.updatePlayListMusicPlayedAll(false)
  }
  return onPlayListAction((action): void => {
    switch (action.action) {
      case 'set':
        set(action.data)
        break
      case 'add':
        add(action.data)
        break
      case 'update':
        update(action.data)
        break
      case 'remove':
        remove(action.data)
        break
      case 'posUpdate':
        posUpdate(action.data)
        break
      case 'played':
        played(action.data)
        break
      case 'unplayed':
        unplayed(action.data)
        break
      case 'unplayedAll':
        unplayedAll()
        break
      // default:
      //   console.warn('unknown action:', action)
      //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      //   let unknownAction: never = action
    }
  })
}
