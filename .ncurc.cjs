const minor = ['@types/node', 'undici', 'typescript', 'electron', 'electron-debug', 'stylelint']
const newest = ['oxfmt']
const patch = []
const ignore = ['@types/ws', '@swc/html']

const cooldown = '8h'

module.exports = [
  {
    reject: [...ignore, ...newest, ...minor, ...patch],
    cooldown,
  },
  {
    target: 'newest',
    filter: newest,
    cooldown,
  },
  // {
  //   target: 'patch',
  //   filter: [],
  // },
  {
    target: 'minor',
    filter: minor,
    cooldown,
  },
]
