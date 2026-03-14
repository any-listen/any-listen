const minor = ['electron', '@types/node', '@eslint/js', 'eslint', 'stylelint']
const newest = ['electron-builder', 'electron-updater', 'vite', 'oxfmt']
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
