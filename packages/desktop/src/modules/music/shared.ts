import { existTimeExp } from '@any-listen/app/modules/music/utils'

import { appState } from '@/app'
import { checkAndCreateDir, joinPath, tmpdir } from '@/shared/utils'
import { workers } from '@/worker'

export const getTempDir = async () => {
  const tempDir = joinPath(tmpdir(), 'anylisten_temp')
  await checkAndCreateDir(tempDir)
  return tempDir
}

export const getCachedLyricInfo = async (musicInfo: AnyListen.Music.MusicInfo): Promise<AnyListen.Music.LyricInfo | null> => {
  let lrcInfo = await workers.dbService.getRawLyric(musicInfo.id)
  // lrcInfo = {} as unknown as AnyListen.Player.LyricInfo
  if (existTimeExp.test(lrcInfo.lyric)) {
    return lrcInfo
  }
  return null
}

export const saveLyricInfo = async (musicInfo: AnyListen.Music.MusicInfo, info: AnyListen.Music.LyricInfo) => {
  await workers.dbService.rawLyricSave(musicInfo.id, info)
}

// TODO rawlrcInfo s2t
export const buildLyricInfo = async (lyricInfo: AnyListen.Music.LyricInfo): Promise<AnyListen.Music.LyricInfo> => {
  if (appState.appSetting['player.isS2t']) {
    const tasks = [
      lyricInfo.lyric ? workers.utilService.langS2T(lyricInfo.lyric) : Promise.resolve(''),
      lyricInfo.tlyric ? workers.utilService.langS2T(lyricInfo.tlyric) : Promise.resolve(''),
      lyricInfo.rlyric ? workers.utilService.langS2T(lyricInfo.rlyric) : Promise.resolve(''),
      lyricInfo.awlyric ? workers.utilService.langS2T(lyricInfo.awlyric) : Promise.resolve(''),
    ]
    return Promise.all(tasks).then(([lyric, tlyric, rlyric, awlyric]) => {
      return {
        ...lyricInfo,
        lyric,
        tlyric,
        rlyric,
        awlyric,
      }
    })
  }
  return lyricInfo
}
