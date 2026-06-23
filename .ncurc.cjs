const minor = ['@types/node', '@eslint/js', 'eslint', 'undici']
const newest = ['oxfmt']
const patch = []
const ignore = ['@types/ws', 'electron']

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
