import { ipc } from '@/shared/ipcMain/ipc'

export { setLines, setOffset, setText } from './commit'

export const getPlayerCurrentTime = async () => {
  return ipc.getPlayerCurrentTime()
}
