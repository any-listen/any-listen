import type { MAIN_ALL_COMMANDS } from '@any-listen/common/command'
import ExecEvent, { type EventType } from '@any-listen/common/ExecEvent'

type LocalCommands = (typeof MAIN_ALL_COMMANDS)[number]
class MainEvent extends ExecEvent {
  async executeEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    return this.execute(eventName, ...args)
  }

  async viewMainCommand(command: string, ...args: unknown[]) {
    return this.execute('viewMainCommand', command, ...args)
  }

  async extensionCommand(command: string, ...args: unknown[]) {
    return this.execute('extensionCommand', command, ...args)
  }

  async mainCommand(command: LocalCommands, ...args: unknown[]) {
    return this.executeEvent(command, ...args)
  }

  async minimize() {
    return this.executeEvent('minimize')
  }

  async fullscreenToggle(fullscreen?: boolean) {
    return this.executeEvent('fullscreenToggle', fullscreen)
  }

  async close(isForce: boolean) {
    return this.executeEvent('close', isForce)
  }

  async exit() {
    return this.executeEvent('exit')
  }

  async hide() {
    return this.executeEvent('hide')
  }

  async show() {
    return this.executeEvent('show')
  }

  async hideToggle() {
    return this.executeEvent('hideToggle')
  }

  async 'desktopLyric.showToggle'() {
    return this.executeEvent('desktopLyric.showToggle')
  }

  async 'desktopLyric.alwaysOnTopToggle'() {
    return this.executeEvent('desktopLyric.alwaysOnTopToggle')
  }

  async 'desktopLyric.lockToggle'() {
    return this.executeEvent('desktopLyric.lockToggle')
  }
}

type EventMethods = Omit<MainEvent, keyof ExecEvent | 'executeEvent'>

export const commandEvent = new MainEvent() as EventType<MainEvent>
