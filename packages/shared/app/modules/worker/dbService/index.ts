import { exposeWorker } from '../utils/worker'
import { init } from './db'
import {
  dislike_list,
  download,
  lyric,
  metadata,
  music_library,
  music_other_source,
  music_url,
  play_count,
  play_list,
} from './modules/index'

const common = {
  init,
}

void exposeWorker<{
  inited: () => void
}>({
  ...common,
  ...metadata,
  ...play_list,
  ...music_library,
  ...lyric,
  ...music_url,
  ...music_other_source,
  ...download,
  ...dislike_list,
  ...play_count,
}).then(({ remote }) => {
  remote.inited()
})

export type workerDBSeriveTypes = typeof common &
  typeof metadata &
  typeof play_list &
  typeof music_library &
  typeof lyric &
  typeof music_url &
  typeof music_other_source &
  typeof download &
  typeof dislike_list &
  typeof play_count
