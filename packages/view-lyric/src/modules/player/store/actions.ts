import { playerAction } from '@/shared/ipcMain'

import { playerEvent } from './event'

export {
  setPlayerPlaying,
  setPlaying,
  setLoadErrorPicUrl,
  setProgress,
  setPlaybackRate as setStatePlaybackRate,
  setVolume as setStateVolume,
  setVolumeMute as setStateVolumeMute,
  setStatusText,
  setMusicInfo,
} from './commit'

export { registerPlayerRemoteEvent } from './playerRemoteEvent'

export const sendCreatedEvent = () => {
  playerEvent.created()
}

export const sendInitedEvent = () => {
  playerEvent.inited()
}

export const play = async () => {
  await playerAction({
    action: 'play',
  })
}

export const pause = async () => {
  await playerAction({
    action: 'pause',
  })
}

export const togglePlay = async () => {
  await playerAction({
    action: 'toggle',
  })
}

export const stop = async () => {
  await playerAction({
    action: 'stop',
  })
}

export const skipNext = async () => {
  await playerAction({
    action: 'next',
  })
}

export const skipPrev = async () => {
  await playerAction({
    action: 'prev',
  })
}

export const seekTo = async (position: number) => {
  await playerAction({
    action: 'seek',
    data: position,
  })
}

export const setLyricOffset = async (offset: number) => {
  await playerAction({
    action: 'lyricOffset',
    data: offset,
  })
}

export const collectMusic = async () => {
  await playerAction({
    action: 'collectStatus',
    data: true,
  })
}

export const uncollectMusic = async () => {
  await playerAction({
    action: 'collectStatus',
    data: false,
  })
}

export const playId = async (id: string) => {
  await playerAction({
    action: 'skip',
    data: id,
  })
}

export const setPlaybackRate = async (rate: number) => {
  await playerAction({
    action: 'playbackRate',
    data: rate,
  })
}

export const setVolume = async (volume: number) => {
  await playerAction({
    action: 'volume',
    data: volume,
  })
}

export const setVolumeMute = async (mute: boolean) => {
  await playerAction({
    action: 'volumeMute',
    data: mute,
  })
}

export const dislikeMusic = async () => {
  await playerAction({
    action: 'dislike',
  })
}
