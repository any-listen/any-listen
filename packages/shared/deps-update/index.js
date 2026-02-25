import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import chalk from 'chalk'
import { run as runNcu } from 'npm-check-updates'

const root = path.join(import.meta.dirname, '../../../')

const packages = [
  '.',
  'packages/desktop',
  'packages/view-main',
  'packages/web-server',
  ...fs.readdirSync(path.join(root, 'packages/shared')).map((p) => `packages/shared/${p}`),
].map((p) => path.join(root, p, 'package.json'))

const configs = createRequire(path.join(import.meta.dirname, import.meta.filename))(path.join(root, '.ncurc.cjs'))

/**
 *
 * @param {string} filePath
 * @returns
 */
const getProjectName = (filePath) => {
  let relativePath = filePath.replace(root, '')
  relativePath = relativePath.startsWith(path.sep) ? relativePath.slice(1) : relativePath
  return relativePath.replace(`${path.sep}package.json`, '')
}

const nochange = chalk.gray
const colors = [
  chalk.red, // major
  chalk.yellow, // minor
  chalk.green, // patch
]
/**
 *
 * @param {string} oldVer
 * @param {string} newVer
 */
const parseNewVersion = (oldVer, newVer) => {
  if (!oldVer.includes('.') || !newVer.includes('.')) return chalk.green(newVer)
  let prevfix = /^(?:[^\d])+/.exec(newVer)?.[0] || ''
  const oldParts = oldVer
    .replace(/^(?:[^\d])+/, '')
    .split('.')
    .map(Number)
  const newParts = newVer.replace(prevfix, '').split('.').map(Number)
  if (oldParts.length !== 3 || newParts.length !== 3) return chalk.green(newVer)
  let prevColor = nochange
  if (prevfix) prevfix = nochange(prevfix)
  return (
    prevfix +
    newParts
      .map((n, i) => {
        if (prevColor !== nochange) return prevColor(n)
        if (n > oldParts[i]) {
          prevColor = colors[i]
          return prevColor(n)
        }
        return nochange(n)
      })
      .join(nochange('.'))
  )
}

// console.log(
//   parseNewVersion('^1.2.3', '^2.0.0'),
//   parseNewVersion('^1.2.3', '^1.3.0'),
//   parseNewVersion('~1.2.3', '~1.3.4'),
//   parseNewVersion('1.2.3', '1.2.4')
// )
/**
 * @type {Array<[string, Array<[string, string, string]>]>}
 */
let logs = []
/**
 *
 * @param {string} filePath
 * @param {Record<string, string>} oldPkgs
 * @param {Array<[string, string]>} updatedPkgs
 */
const addLog = async (filePath, oldPkgs, updatedPkgs) => {
  if (!updatedPkgs.length) return
  logs.push([getProjectName(filePath), updatedPkgs.map(([k, v]) => [k, oldPkgs[k], parseNewVersion(oldPkgs[k], v)])])
  //   logs += `${getProjectName(filePath)}:
  // ${updatedPkgs.map(([k, v]) => `    ${chalk.blue(k)}: ${chalk.gray(oldPkgs[k])} → ${parseNewVersion(oldPkgs[k], v)}`).join('\n')}
  // `
}
/**
 *
 * @param {number} length
 * @returns
 */
const padding = (length) => {
  return ' '.repeat(length)
}
const printLog = () => {
  if (!logs.length) return
  let logsStr = ''
  let maxNLen = 0
  let maxOerLen = 0
  for (const group of logs) {
    for (const item of group[1]) {
      maxNLen = Math.max(maxNLen, item[0].length)
      maxOerLen = Math.max(maxOerLen, item[1].length)
    }
  }
  for (const group of logs) {
    logsStr += `${group[0]}:
${group[1].map(([k, o, n]) => `    ${chalk.blue(k)}: ${padding(maxNLen - k.length + (maxOerLen - o.length))}${chalk.gray(o)}  →  ${n}`).join('\n')}
`
  }
  console.log(logsStr)
}
const run = async () => {
  for (const packageFile of packages) {
    const pkg = JSON.parse((await fs.promises.readFile(packageFile, 'utf-8')).toString())
    const oldPkgs = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
    const updatedPkgs = {}
    console.log(`Checking ${chalk.blue(getProjectName(packageFile))}...`)
    for (const config of configs) {
      const updated = await runNcu({
        packageFile,
        upgrade: true,
        // cooldown: '8h',
        jsonUpgraded: true,
        dep: ['prod', 'dev', 'optional'],
        ...config,
      })
      if (typeof updated == 'object') {
        Object.assign(updatedPkgs, updated)
      } else console.log(updated)
    }
    addLog(packageFile, oldPkgs, Object.entries(updatedPkgs))
  }
  printLog()
}

run()
