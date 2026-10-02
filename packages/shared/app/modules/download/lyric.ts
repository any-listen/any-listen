import fs from 'node:fs/promises'

import { buildLyrics } from '@any-listen/nodejs/lrcTool'
import iconv from 'iconv-lite'

import type { Options } from './service'

export const prepareDownloadLyric = async (
  item: AnyListen.Download.ListItem,
  audioPath: string,
  options: Options,
  checkActive: () => void
) => {
  const settings = item.metadata.task!.settings
  const warnings: string[] = []
  let lyricPath: string | undefined
  if (settings['download.isDownloadLrc']) {
    try {
      if (!options.getLyricInfo) throw new Error('Lyric resource unavailable')
      const { info: lyric } = await options.getLyricInfo({ musicInfo: item.metadata.musicInfo })
      checkActive()
      if (!lyric.lyric.trim()) throw new Error('Empty lyric')
      const content = buildLyrics(
        lyric,
        settings['download.isDownloadLxLrc'],
        settings['download.isDownloadTLrc'],
        settings['download.isDownloadRLrc']
      )
      const target = `${audioPath}.lrc`
      await fs.writeFile(target, iconv.encode(content, settings['download.lrcFormat'], { addBOM: true }), { flag: 'wx' })
      checkActive()
      lyricPath = target
    } catch (err) {
      checkActive()
      options.onError(err)
      warnings.push(options.translate('download.lyric_warning', { error: err instanceof Error ? err.message : String(err) }))
    }
  }
  return { lyricPath, warnings }
}
