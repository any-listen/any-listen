import { ipc } from '../ipc'

export const sendInitedEvent = async () => {
  return ipc.inited()
}

export const mouseEnterLeave = async (isEnter: boolean) => {
  return ipc.mouseEnterLeave(isEnter)
}

export const setWinBounds = async (bounds: AnyListen.DesktopLyric.NewBounds) => {
  return ipc.setWinBounds(bounds)
}
