import { createWorkers } from './worker'

export const initWorkers = async () => {
  createWorkers()
}

export { workers } from './worker'
