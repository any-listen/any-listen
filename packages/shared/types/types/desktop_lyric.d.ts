declare namespace AnyListen {
  namespace DesktopLyric {
    type ViewMainActions = 'get_info' | 'get_status' | 'get_analyser_data_array'

    interface LyricActionBase<A> {
      action: A
    }
    interface LyricActionData<A, D> extends LyricActionBase<A> {
      data: D
    }
    type LyricAction<A, D = undefined> = D extends undefined ? LyricActionBase<A> : LyricActionData<A, D>

    type LyricActions =
      | LyricAction<
          'set_info',
          {
            id: string | null
            singer: string
            name: string
            album: string
            lrc: string | null
            tlrc: string | null
            rlrc: string | null
            awlrc: string | null
            // pic: string | null
            isPlay: boolean
            line: number
            played_time: number
          }
        >
      | LyricAction<
          'set_status',
          {
            isPlay: boolean
            line: number
            played_time: number
          }
        >
      | LyricAction<
          'set_lyric',
          {
            lrc: string | null
            tlrc: string | null
            rlrc: string | null
            awlrc: string | null
          }
        >
      | LyricAction<'set_offset', number>
      | LyricAction<'set_playbackRate', number>
      | LyricAction<'set_play', number>
      | LyricAction<'set_pause'>
      | LyricAction<'set_stop'>
      | LyricAction<'send_analyser_data_array', Uint8Array>

    interface NewBounds {
      x: number
      y: number
      w: number
      h: number
    }
  }
}
