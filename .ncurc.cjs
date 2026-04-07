const minor = ['electron', '@types/node', '@eslint/js', 'eslint', 'typescript', 'undici']
const newest = ['electron-builder', 'electron-updater', 'oxfmt']
const patch = []

module.exports = [
  {
    reject: [...newest, ...minor, ...patch],
  },
  {
    target: 'newest',
    filter: newest,
  },
  // {
  //   target: 'patch',
  //   filter: [],
  // },
  {
    target: 'minor',
    filter: minor,
  },
]
