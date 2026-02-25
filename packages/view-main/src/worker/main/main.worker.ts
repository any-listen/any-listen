import { exposeWorker } from '../utils/worker'
// import * as common from './common'
import * as list from './list'
import * as tools from './tools'
// import * as music from './music'

console.log('hello main worker')

exposeWorker({ ...tools, ...list }).remote.inited()

export type workerMainTypes = typeof list & typeof tools
