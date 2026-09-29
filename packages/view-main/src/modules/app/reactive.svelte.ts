import { IPC_CODE } from '@any-listen/common/constants'

import { useSettingValue } from '@/modules/setting/reactive.svelte'
import { getFontSizeWithScreen } from '@/shared'

import { settingEvent } from '../setting/store/event'
import { appEvent } from './store/event'
import { appState } from './store/state'

export const useAppAeady = () => {
  let appAeady = $state.raw(false)

  const unsubscribe = settingEvent.on('inited', () => {
    appAeady = true
  })
  const unsubscribe2 = appEvent.on('desconnected', () => {
    appAeady = false
  })

  $effect(() => {
    return () => {
      unsubscribe()
      unsubscribe2()
    }
  })

  return {
    get appAeady() {
      return appAeady
    },
  }
}

export const useShowLogin = () => {
  let showLogin = $state.raw(false)

  const unsubscribe = appEvent.on('connected', () => {
    showLogin = false
  })
  const unsubscribe2 = appEvent.on('release', () => {
    showLogin = true
  })
  const unsubscribe3 = appEvent.on('connectFailed', (message) => {
    switch (message) {
      case IPC_CODE.authFailed:
      case IPC_CODE.missingAuthCode:
        showLogin = true
        break
    }
  })

  $effect(() => {
    return () => {
      unsubscribe()
      unsubscribe2()
      unsubscribe3()
    }
  })

  return {
    get showLogin() {
      return showLogin
    },
  }
}

export const useIsFullscreen = () => {
  let isFullscreen = $state.raw(appState.isFullscreen)

  const unsubscribe = appEvent.on('fullscreen', (val) => {
    isFullscreen = val
  })

  $effect(() => {
    return () => {
      unsubscribe()
    }
  })

  return {
    get isFullscreen() {
      return isFullscreen
    },
  }
}

export const useListItemHeight = (height: number) => {
  const fontSize = useSettingValue('common.fontSize')
  let listItemHeight = $state.raw(Math.ceil((appState.isFullscreen ? getFontSizeWithScreen() : fontSize.val) * height))

  $effect(() => {
    return appEvent.on('fullscreen', (val) => {
      listItemHeight = Math.ceil((val ? getFontSizeWithScreen() : fontSize.val) * height)
    })
  })
  return {
    get val() {
      return listItemHeight
    },
  }
}
