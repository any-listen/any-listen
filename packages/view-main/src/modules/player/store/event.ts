import _Event, { type EventType } from '@any-listen/web/Event'

import type { InitState } from './state'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  created() {
    this.emitEvent('created')
  }

  setProgress(time: number, maxTime?: number) {
    this.emitEvent('setProgress', time, maxTime)
  }

  setPlaybackRate(rate: number) {
    this.emitEvent('setPlaybackRate', rate)
  }

  setLyricOffset(offset: number) {
    this.emitEvent('setLyricOffset', offset)
  }

  setVolume(val: number) {
    this.emitEvent('setVolume', val)
  }

  setVolumeIsMute(val: boolean) {
    this.emitEvent('setVolumeIsMute', val)
  }

  setPreservesPitch(val: boolean) {
    this.emitEvent('setPreservesPitch', val)
  }

  volumeChanged(val: number) {
    this.emitEvent('volumeChanged', val)
  }

  volumeMuteChanged(val: boolean) {
    this.emitEvent('volumeMuteChanged', val)
  }

  playbackRateUpdated(rate: number) {
    this.emitEvent('playbackRateUpdated', rate)
  }

  musicChanged(index: number, historyListIndex: number, lastTrackId?: string | null) {
    // console.warn('musicChanged', index, historyListIndex)
    this.emitEvent('musicChanged', index, historyListIndex, lastTrackId)
  }

  musicInfoChanged(musicInfo: Partial<InitState['musicInfo']>) {
    this.emitEvent('musicInfoChanged', musicInfo)
  }

  picUpdated(pic: string | null) {
    this.emitEvent('picUpdated', pic)
  }

  lyricUpdated(lyricInfo: AnyListen.Music.LyricInfo) {
    this.emitEvent('lyricUpdated', lyricInfo)
  }

  lyricOffsetUpdated(offset: number) {
    this.emitEvent('lyricOffsetUpdated', offset)
  }

  playMusicInfoChanged(playMusicInfo: InitState['playMusicInfo']) {
    this.emitEvent('playMusicInfoChanged', playMusicInfo)
  }

  playInfoChanged(playInfo: Partial<InitState['playInfo']>) {
    // console.warn('playInfoChanged', playInfo)
    this.emitEvent('playInfoChanged', playInfo)
  }

  statusTextChanged(text: InitState['statusText']) {
    this.emitEvent('statusTextChanged', text)
  }

  titleChanged(text: InitState['title']) {
    this.emitEvent('titleChanged', text)
  }

  playStatusChanged(state: InitState['playing']) {
    this.emitEvent('playStatusChanged', state)
  }

  playerPlayStatusChanged(state: InitState['playerPlaying']) {
    this.emitEvent('playerPlayStatusChanged', state)
  }

  durationChanged(progress: InitState['progress']) {
    this.emitEvent('durationChanged', progress)
  }

  progressChanged(progress: InitState['progress'], old: InitState['progress']) {
    this.emitEvent('progressChanged', progress, old)
  }

  playListMusicChanged(playedList: InitState['playList']) {
    this.emitEvent('playListMusicChanged', playedList)
  }

  playListMusicUpdated(playedList: InitState['playList']) {
    if (!playedList.length) return
    this.emitEvent('playListMusicUpdated', playedList)
  }

  playListMusicOverwrited(list: AnyListen.Player.PlayMusicInfo[]) {
    this.emitEvent('playListMusicOverwrited', list)
  }

  playListMusicAdded(position: number, list: AnyListen.Player.PlayMusicInfo[]) {
    this.emitEvent('playListMusicAdded', position, list)
  }

  playListMusicRemoved(ids: string[]) {
    this.emitEvent('playListMusicRemoved', ids)
  }

  playListChanged(playedList: InitState['playList']) {
    this.emitEvent('playListChanged', playedList)
  }

  playHistoryListChanged(list: InitState['playHistoryList']) {
    this.emitEvent('playHistoryListChanged', list)
  }

  playHistoryListOverwrited(list: AnyListen.IPCPlayer.PlayHistoryListItem[]) {
    this.emitEvent('playHistoryListOverwrited', list)
  }

  playHistoryListAdded(list: AnyListen.IPCPlayer.PlayHistoryListItem[]) {
    this.emitEvent('playHistoryListAdded', list)
  }

  playHistoryListRemoved(idx: number[]) {
    this.emitEvent('playHistoryListRemoved', idx)
  }

  // 播放器事件
  play() {
    this.emitEvent('play')
  }

  pause() {
    this.emitEvent('pause')
  }

  stop() {
    this.emitEvent('stop')
  }

  error(code?: number) {
    this.emitEvent('error', code)
  }

  // 播放器原始事件
  playerPlaying() {
    this.emitEvent('playerPlaying')
  }

  playerPause() {
    this.emitEvent('playerPause')
  }

  playerStop() {
    this.emitEvent('playerStop')
  }

  playerEnded() {
    this.emitEvent('playerEnded')
  }

  playerError(code?: number) {
    this.emitEvent('playerError', code)
  }

  playerLoadeddata() {
    this.emitEvent('playerLoadeddata')
  }

  playerLoadstart() {
    this.emitEvent('playerLoadstart')
  }

  playerCanplay() {
    this.emitEvent('playerCanplay')
  }

  playerEmptied() {
    this.emitEvent('playerEmptied')
  }

  playerWaiting() {
    this.emitEvent('playerWaiting')
  }

  activePlayProgressTransition() {
    this.emitEvent('activePlayProgressTransition')
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const playerEvent = new Event() as EventType<Event>
