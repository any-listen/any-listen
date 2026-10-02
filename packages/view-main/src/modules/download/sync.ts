export const applyDownloadAction = (list: AnyListen.Download.ListItem[], action: AnyListen.Download.ListAction) => {
  switch (action.action) {
    case 'clear':
      return []
    case 'remove': {
      const removed = new Set(action.data)
      return list.filter((item) => !removed.has(item.id))
    }
    case 'add': {
      const ids = new Set(action.data.map((item) => item.id))
      const remaining = list.filter((item) => !ids.has(item.id))
      return action.position === 'top' ? [...action.data, ...remaining] : [...remaining, ...action.data]
    }
    case 'update': {
      const items = new Map(action.data.map((item) => [item.id, item]))
      // Updates never recreate a task removed by an earlier action.
      return list.map((item) => items.get(item.id) ?? item)
    }
  }
}
