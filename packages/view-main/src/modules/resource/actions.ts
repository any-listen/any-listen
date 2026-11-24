import { getLocation, push, replace, type Params } from '@/plugins/routes'
import { urlParamKeyMap } from '@/views/Online/shared.svelte'

const historys: Array<[string, Params]> = []
export const setLastHistory = (path: string, query: Params) => {
  const last = historys[historys.length - 1] as [string, Params] | undefined
  if (last) {
    if (path == '/online') {
      if (query[urlParamKeyMap.type] == last[1][urlParamKeyMap.type]) {
        last[0] = path
        last[1] = query
        return
      }
    } else if (path == last[0]) return
  }
  historys.push([path, query])
}
export const pushRoute = (path: string, query: Params) => {
  historys.push([path, query])
  void push(path, query)
}
export const replaceRoute = (path: string, query: Params) => {
  const last = historys[historys.length - 1] as [string, Params] | undefined
  if (last) {
    last[0] = path
    last[1] = query
  } else {
    historys.push([path, query])
  }
  void replace(path, query)
}

export const back = () => {
  const loc = getLocation()
  if (loc.location.startsWith('/online')) {
    const last = historys.pop()
    if (last && historys.length) {
      const current = historys[historys.length - 1]
      void replace(current[0], current[1])
      return
    }
    void replace('/online')
  } else {
    if (historys.length) {
      const current = historys[historys.length - 1]
      void replace(current[0], current[1])
      return
    }
    void replace('/online')
  }
}

const buildQueryParams = (params: Params, text?: string) => {
  if (text != null) {
    if (text) params[urlParamKeyMap.query] = text
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    else delete params[urlParamKeyMap.query]

    if (params[urlParamKeyMap.type] != 'search') {
      params[urlParamKeyMap.type] = 'search'
    }
  }
  return params
}
export const toOnlineSearch = async (text?: string) => {
  const loc = getLocation()
  const lastLoc = historys[historys.length - 1] as [string, Params] | undefined
  if (text) {
    if (loc.location.startsWith('/online')) {
      const params = buildQueryParams({ ...loc.query }, text)
      await replace('/online', params)
    } else {
      const params = buildQueryParams(lastLoc ? { ...lastLoc[1] } : {}, text)
      await push('/online', params)
    }
  } else if (loc.location.startsWith('/online')) {
    const params = buildQueryParams({ ...loc.query }, text)
    await replace('/online', params)
    console.log('historys after replace:', [...historys])
  } else {
    const [path, query] = lastLoc || ['/online', {}]
    const params = buildQueryParams(query, text)
    await push(path, params)
  }
}
