import { app } from 'electron'

import { appState } from './state'

export const setSkipTrayQuit = (isSkipTrayQuit: boolean) => {
  appState.isSkipTrayQuit = isSkipTrayQuit
}
export const quit = () => {
  setSkipTrayQuit(true)
  app.quit()
}
