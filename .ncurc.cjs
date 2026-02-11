const minor = ['electron', '@types/node', 'stylelint', '@eslint/js', 'eslint']
const newest = ['electron-builder', 'electron-updater']
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
