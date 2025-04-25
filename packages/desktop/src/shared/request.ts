// import progress from 'request-progress'
// import { appState } from '@/app'
// import fs from 'fs'

// export const requestMsg = {
//   fail: '请求异常😮，可以多试几次，若还是不行就换一首吧。。。',
//   unachievable: '哦No😱...接口无法访问了！',
//   timeout: '请求超时',
//   // unachievable: '哦No😱...接口无法访问了！已帮你切换到临时接口，重试下看能不能播放吧~',
//   notConnectNetwork: '无法连接到服务器',
//   cancelRequest: '取消http请求',
// } as const

export { request, setProxy } from '@any-listen/nodejs/request'

export type { Options } from '@any-listen/nodejs/request'
