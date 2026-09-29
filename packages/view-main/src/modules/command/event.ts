import type { VIEW_MAIN_ALL_COMMANDS } from '@any-listen/common/command'
import ExecEvent, { type EventType } from '@any-listen/common/ExecEvent'

type LocalCommands = (typeof VIEW_MAIN_ALL_COMMANDS)[number]
class MainEvent extends ExecEvent {
  async executeEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    return this.execute(eventName, ...args)
  }

  async mainCommand(command: string, ...args: unknown[]) {
    return this.execute('mainCommand', command, ...args)
  }

  async viewMainCommand(command: LocalCommands, ...args: unknown[]) {
    return this.executeEvent(command, ...args)
  }

  async run() {
    return this.executeEvent('run')
  }

  async play() {
    return this.executeEvent('play')
  }

  async pause() {
    return this.executeEvent('pause')
  }

  async playToggle() {
    return this.executeEvent('playToggle')
  }

  async next() {
    return this.executeEvent('next')
  }

  async previous() {
    return this.executeEvent('previous')
  }

  async favorite() {
    return this.executeEvent('favorite')
  }

  async unfavorite() {
    return this.executeEvent('unfavorite')
  }

  async dislike() {
    return this.executeEvent('dislike')
  }

  async muteToggle(mute?: boolean) {
    return this.executeEvent('muteToggle', mute)
  }

  async volumeUp(volume?: number) {
    return this.executeEvent('volumeUp', volume)
  }

  async volumeDown(volume?: number) {
    return this.executeEvent('volumeDown', volume)
  }

  async seekForward(time?: number) {
    return this.executeEvent('seekForward', time)
  }

  async seekBackward(time?: number) {
    return this.executeEvent('seekBackward', time)
  }

  async showMusicComment() {
    return this.executeEvent('showMusicComment')
  }

  async focusSearchInput() {
    return this.executeEvent('focusSearchInput')
  }

  async logout() {
    return this.executeEvent('logout')
  }
  async maximizeToggle() {
    return this.executeEvent('maximizeToggle')
  }
}

type EventMethods = Omit<MainEvent, keyof ExecEvent | 'executeEvent'>

export const commandEvent = new MainEvent() as EventType<MainEvent>
