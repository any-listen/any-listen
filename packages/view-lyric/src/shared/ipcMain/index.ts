import { ipc } from './ipc'

export const getPlayerInfo = async () => {
  return ipc.getPlayerInfo()
}

export const playerAction = async (action: AnyListen.IPCPlayer.ActionPlayer) => {
  return ipc.playerAction(action)
}
