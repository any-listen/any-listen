import { playerState } from '@/modules/player/store/state'
import { getAnalyser } from '@/plugins/player'
import { createDesktopLyricProcessEvent } from '@/shared/ipc/app/event'

import { lyricState } from './store/state'

let desktopLyricPort: MessagePort | null = null
const analyserTools: {
  dataArray: Uint8Array
  bufferLength: number
  analyser: AnalyserNode | null
  sendDataArray: () => void
} = {
  dataArray: new Uint8Array(),
  bufferLength: 0,
  analyser: null,
  sendDataArray() {
    if (this.analyser == null) {
      this.analyser = getAnalyser()
      // console.log(this.analyser)
      if (!this.analyser) return
      this.bufferLength = this.analyser.frequencyBinCount
    }
    const dataArray = new Uint8Array(this.bufferLength)
    this.analyser.getByteFrequencyData(dataArray)
    sendDesktopLyricInfo(
      {
        action: 'send_analyser_data_array',
        data: dataArray,
      },
      [dataArray.buffer]
    )
  },
}

export const setOffset = (offset: number) => {
  sendDesktopLyricInfo({
    action: 'set_offset',
    data: offset,
  })
}
export const setPlaybackRate = (rate: number) => {
  sendDesktopLyricInfo({
    action: 'set_playbackRate',
    data: rate,
  })
}
export const setLyric = (lyrics: { lrc: string | null; tlrc: string | null; rlrc: string | null; awlrc: string | null }) => {
  sendDesktopLyricInfo({
    action: 'set_lyric',
    data: lyrics,
  })
}
export const play = (currentTime: number) => {
  sendDesktopLyricInfo({ action: 'set_play', data: currentTime })
}
export const pause = () => {
  sendDesktopLyricInfo({ action: 'set_pause' })
}
export const stop = () => {
  sendDesktopLyricInfo({ action: 'set_stop' })
}

const sendDesktopLyricInfo = (info: AnyListen.DesktopLyric.LyricActions, transferList?: Transferable[]) => {
  if (desktopLyricPort == null) return
  if (transferList) desktopLyricPort.postMessage(info, transferList)
  else desktopLyricPort.postMessage(info)
}

const handleDesktopLyricMessage = (action: AnyListen.DesktopLyric.ViewMainActions) => {
  switch (action) {
    case 'get_info':
      sendDesktopLyricInfo({
        action: 'set_info',
        data: {
          id: playerState.musicInfo.id,
          singer: playerState.musicInfo.singer,
          name: playerState.musicInfo.name,
          album: playerState.musicInfo.album,
          lrc: playerState.musicInfo.lrc,
          tlrc: playerState.musicInfo.tlrc,
          rlrc: playerState.musicInfo.rlrc,
          awlrc: playerState.musicInfo.awlrc,
          // pic: playerState.musicInfo.pic,
          isPlay: playerState.playerPlaying,
          line: lyricState.line,
          played_time: playerState.progress.nowPlayTime * 1000,
        },
      })
      break
    case 'get_status':
      sendDesktopLyricInfo({
        action: 'set_status',
        data: {
          isPlay: playerState.playerPlaying,
          line: lyricState.line,
          played_time: playerState.progress.nowPlayTime * 1000,
        },
      })
      break
    case 'get_analyser_data_array':
      analyserTools.sendDataArray()
      break
  }
}

export const sendMusicInfo = (time: number) => {
  sendDesktopLyricInfo({
    action: 'set_info',
    data: {
      id: playerState.musicInfo.id,
      singer: playerState.musicInfo.singer,
      name: playerState.musicInfo.name,
      album: playerState.musicInfo.album,
      lrc: playerState.musicInfo.lrc,
      tlrc: playerState.musicInfo.tlrc,
      rlrc: playerState.musicInfo.rlrc,
      awlrc: playerState.musicInfo.awlrc,
      // pic: musicInfo.pic,
      isPlay: playerState.playerPlaying,
      line: lyricState.line,
      played_time: time,
    },
  })
}

export const initDesktopLyric = () => {
  return createDesktopLyricProcessEvent.on((ports) => {
    console.log('onNewDesktopLyricProcess')
    const [port] = ports
    desktopLyricPort = port

    port.onmessage = ({ data }) => {
      handleDesktopLyricMessage(data.action)
      // The event data can be any serializable object (and the event could even
      // carry other MessagePorts with it!)
      // const result = doWork(event.data)
      // port.postMessage(result)
    }

    port.onmessageerror = (event) => {
      console.log('onmessageerror', event)
    }
  })
}
