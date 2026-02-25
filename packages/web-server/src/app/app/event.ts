import _Event, { type EventType } from '@any-listen/nodejs/Event'

import type { ServerSocket } from '@/modules/ipc/websocket'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  /**
   * 初始化APP
   */
  inited() {
    this.emitEvent('inited')
  }

  /**
   * 已更新的配置
   * @param keys 已更新配置的key
   * @param setting 已更新配置
   */
  updated_config(keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) {
    this.emitEvent('updated_config', keys, setting)
  }

  system_theme_change(isDark: boolean) {
    this.emitEvent('system_theme_change', isDark)
  }

  locale_change(locale: AnyListen.Locale) {
    this.emitEvent('locale_change', locale)
  }

  proxy_changed(host: string, port: string) {
    this.emitEvent('locale_change', host, port)
  }

  clientConnected(socket: ServerSocket) {
    this.emitEvent('clientConnected', socket)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const appEvent = new Event() as EventType<Event>
