import SimpleSingleEvent from '@any-listen/web/SimpleSingleEvent'
import { tick } from 'svelte'
import { derived, readable } from 'svelte/store'

export interface Location {
  /** Raw location from the hash, for example `#/book?id=1` */
  rawLocation: string
  /** Location (page/view), for example `/book` */
  location: string
  /** Querystring from the hash, as a string not parsed */
  querystring: string
  /** Parsed query parameters */
  query: Record<string, string>
}
// 解析URL参数为对象
const parseUrlParams = (str: string): Record<string, string> => {
  const params: Record<string, string> = {}
  if (typeof str !== 'string') return params
  const paramsArr = str.split('&')
  if (paramsArr.length === 1 && paramsArr[0] === '') return params
  for (const param of paramsArr) {
    const [key, value] = param.split('=')
    params[key] = value ? decodeURIComponent(value) : value
  }
  return params
}
export type Params = Record<string, string | number | null | undefined>
export const buildQueryParams = (params: Params) => {
  return Object.entries(params)
    .filter(([_, value]) => value != null)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
}

/**
 * Returns the current location from the hash.
 *
 * @returns Location object
 * @private
 */
export const getLocation = (): Location => {
  const hashPosition = window.location.href.indexOf('#/')
  let rawLocation = hashPosition > -1 ? window.location.href.substring(hashPosition + 1) : '/'
  let location = rawLocation
  // Check if there's a querystring
  const qsPosition = rawLocation.indexOf('?')
  let querystring = ''
  if (qsPosition > -1) {
    querystring = location.substring(qsPosition + 1)
    location = location.substring(0, qsPosition)
  }

  return { rawLocation, location, querystring, query: parseUrlParams(querystring) }
}

const buildQueryString = (url: string, params?: Params) => {
  if (!params) return ''
  return (url.includes('?') ? (/\?.+/.test(url) ? '&' : '') : '?') + buildQueryParams(params)
}

/**
 * Readable store that returns the current full location (incl. querystring)
 */
export const loc = readable<Location>(
  getLocation(),
  // eslint-disable-next-line prefer-arrow-callback
  function start(set) {
    set(getLocation())

    const update = () => {
      set(getLocation())
    }
    window.addEventListener('hashchange', update, false)

    return function stop() {
      window.removeEventListener('hashchange', update, false)
    }
  }
)

/**
 * Readable store that returns the current location
 */
export const location = derived(loc, (loc) => loc.location)

/**
 * Readable store that returns the current querystring
 */
export const query = derived(loc, (loc) => loc.query)

let _params: RegExpExecArray | Record<string, unknown> = {}
const paramsEvent = new SimpleSingleEvent<[RegExpExecArray | Record<string, unknown>]>()
export const setParams = (params: RegExpExecArray | Record<string, unknown>) => {
  _params = params
  paramsEvent.emit(params)
}

export const params = readable<RegExpExecArray | Record<string, unknown>>(
  _params,
  // eslint-disable-next-line prefer-arrow-callback
  function start(set) {
    set(_params)
    return paramsEvent.on(() => {
      set(_params)
    })
  }
)

/**
 * Store that returns the currently-matched params.
 * Despite this being writable, consumers should not change the value of the store.
 * It is exported as a readable store only (in the typings file)
 */
// export const params = $state()

const verifyLocation = (location: string) => {
  if (!location.length || (!location.startsWith('/') && !location.startsWith('#/'))) {
    throw Error('Invalid parameter location')
  }
}

/**
 * Navigates to a new page programmatically.
 *
 * @param location - Path to navigate to (must start with `/` or `#/` )
 * @return Promise that resolves after the page navigation has completed
 */
export const push = async (location: string, params?: Params) => {
  if (params) location += buildQueryString(location, params)
  verifyLocation(location)

  // Execute this code when the current call stack is complete
  await tick()

  // Note: this will include scroll state in history even when restoreScrollState is false
  history.replaceState(
    {
      ...history.state,
      __svelte_spa_router_scrollX: window.scrollX,
      __svelte_spa_router_scrollY: window.scrollY,
    },
    ''
  )
  window.location.hash = (location.startsWith('#') ? '' : '#') + location
}

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 *
 * @return Promise that resolves after the page navigation has completed
 */
export const pop = async () => {
  // Execute this code when the current call stack is complete
  await tick()

  window.history.back()
}

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param location - Path to navigate to (must start with `/` or '#/')
 * @return Promise that resolves after the page navigation has completed
 */
export const replace = async (location: string, params?: Params) => {
  if (params) location += buildQueryString(location, params)
  verifyLocation(location)

  // Execute this code when the current call stack is complete
  await tick()

  const dest = (location.startsWith('#') ? '' : '#') + location
  try {
    const newState = {
      ...history.state,
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete newState.__svelte_spa_router_scrollX
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete newState.__svelte_spa_router_scrollY
    window.history.replaceState(newState, '', dest)
  } catch (e) {
    console.warn(
      "Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment."
    )
  }

  // The method above doesn't trigger the hashchange event, so let's do that manually
  window.dispatchEvent(new Event('hashchange'))
}

/**
 * The handler attached to an anchor tag responsible for updating the
 * current history state with the current scroll state
 *
 * @param href - Destination
 */
const scrollstateHistoryHandler = (href: string) => {
  // Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
  history.replaceState(
    {
      ...history.state,
      __svelte_spa_router_scrollX: window.scrollX,
      __svelte_spa_router_scrollY: window.scrollY,
    },
    ''
  )
  // This will force an update as desired, but this time our scroll state will be attached
  window.location.hash = href
}

/**
 * Dictionary with options for the link action.
 */
interface LinkActionOpts {
  /** A string to use in place of the link's href attribute. Using this allows for updating link's targets reactively. */
  href?: string
  /** If true, link is disabled */
  disabled?: boolean
}

// Internal function used by the link function
const updateLink = (node: HTMLAnchorElement, opts: LinkActionOpts) => {
  let href = opts.href ?? node.getAttribute('href')

  // Destination must start with '/' or '#/'
  if (href?.startsWith('/')) {
    // Add # to the href attribute
    href = `#${href}`
  } else if (!href || href.length < 2 || !href.startsWith('#/')) {
    throw Error(`Invalid value for "href" attribute: ${href}`)
  }

  node.setAttribute('href', href)
  node.addEventListener('click', (event) => {
    // Prevent default anchor onclick behaviour
    event.preventDefault()
    if (!opts.disabled) {
      scrollstateHistoryHandler(node.getAttribute('href')!)
    }
  })
}

// Internal function that ensures the argument of the link action is always an object
const linkOpts = (val?: string | LinkActionOpts): LinkActionOpts => {
  if (val && typeof val == 'string') {
    return {
      href: val,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (val as LinkActionOpts) || {}
}

/**
 * Svelte Action that enables a link element (`<a>`) to use our history management.
 *
 * For example:
 *
 * ````svelte
 * <a href="/books" {@attach link()}>View books</a>
 * ````
 *
 * @param opts - Options object. For legacy reasons, we support a string too which will be the value for opts.href
 * @param node - The target node (automatically set by Svelte). Must be an anchor tag (`<a>`) with a href attribute starting in `/`
 */
export const link = (opts?: string | LinkActionOpts) => {
  return (node: HTMLAnchorElement) => {
    opts = linkOpts(opts)

    // Only apply to <a> tags
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (node.tagName?.toLowerCase() != 'a') {
      throw Error('Action "link" can only be used with <a> tags')
    }

    updateLink(node, opts)
  }
}

/**
 * Tries to restore the scroll state from the given history state.
 *
 * @param state - The history state to restore from.
 */
export const restoreScroll = (
  state: {
    __svelte_spa_router_scrollX: number
    __svelte_spa_router_scrollY: number
  } | null
) => {
  // If this exists, then this is a back navigation: restore the scroll position
  if (state) {
    window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY)
  } else {
    // Otherwise this is a forward navigation: scroll to top
    window.scrollTo(0, 0)
  }
}
