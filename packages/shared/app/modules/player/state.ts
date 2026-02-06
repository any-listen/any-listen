let playMusicInfo: AnyListen.Player.PlayMusicInfo | null = null

export const getPlayMusicInfo = () => {
  return playMusicInfo
}

export const setPlayMusicInfo = (info: AnyListen.Player.PlayMusicInfo | null) => {
  playMusicInfo = info
}
