export interface LogItem {
  id: string
  name: string
  log: string
}

export type LogType = 'app' | 'extension'

export const LogTypeTabs: LogType[] = ['app', 'extension']
