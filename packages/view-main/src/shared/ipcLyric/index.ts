import { ipc } from './ipc'

export const sendPlayerEvent = async (event: AnyListen.IPCPlayer.PlayerEvent) => {
  return ipc.playerEvent(event)
}
