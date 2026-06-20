export interface InitState {
  proxy: {
    enable: boolean
    host: string
    port: string
    username: string
    password: string

    envProxy?: {
      host: string
      port: string
    }
  }
  workerInitPromiseMain: Promise<void>
  os: 'windows' | 'linux' | 'mac'
}

export const appState: InitState = {
  proxy: {
    enable: false,
    host: '',
    port: '',
    username: '',
    password: '',
  },
  workerInitPromiseMain: Promise.resolve(),
  os: window.os,
}
