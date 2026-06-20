import type { ComponentProps } from 'svelte'

// import Vue from 'vue'
import type Router from '@/plugins/svelte-spa-router/Router.svelte'
import Extenstion from '@/views/Extenstion/index.svelte'
import Library from '@/views/Library/index.svelte'
import Online from '@/views/Online/index.svelte'
import SonglistDetail from '@/views/Online/Songlist/detail/Detail.svelte'
import TopSongsDetail from '@/views/Online/TopSongs/detail/Detail.svelte'
import Search from '@/views/Search/index.svelte'
import Setting from '@/views/Setting/index.svelte'

const routes: ComponentProps<typeof Router>['routes'] = {
  '/online': Online,
  '/online/songlist': SonglistDetail,
  '/online/topSongs': TopSongsDetail,
  '/library': Library,
  '/songList/list': Search,
  '/songList/detail': Search,
  '/topSongs': Search,
  '/list': Search,
  '/download': Search,
  '/settings': Setting,
  '/extenstion': Extenstion,
  '*': Library,
}

// export const query = derived(
//   querystring,
//   (_querystring = '') => {
//     return parseUrlParams(_querystring)
//   },
// )

export default routes

export {
  getLocation,
  link,
  location,
  push,
  query,
  replace,
  buildQueryParams,
  type Params,
} from '@/plugins/svelte-spa-router/navigator'
