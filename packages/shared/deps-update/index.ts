import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { styleText } from 'node:util'

import { run as runNcu, type RunOptions } from 'npm-check-updates'

interface PackageJsonLike {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

type UpdateLogItem = [name: string, oldVersion: string, newVersionColored: string]
type UpdateLogGroup = [projectName: string, items: UpdateLogItem[]]

const root = path.join(import.meta.dirname, '../../../')

const packages = [
  '.',
  'packages/desktop',
  'packages/view-main',
  'packages/view-lyric',
  'packages/web-server',
  ...fs.readdirSync(path.join(root, 'packages/shared')).map((p) => `packages/shared/${p}`),
].map((p) => path.join(root, p, 'package.json'))

const require = createRequire(import.meta.url)
const configs = require(path.join(root, '.ncurc.cjs')) as RunOptions[]

const color = {
  gray: (v: string | number) => styleText('gray', String(v)),
  blue: (v: string | number) => styleText('blue', String(v)),
  red: (v: string | number) => styleText('red', String(v)),
  yellow: (v: string | number) => styleText('yellow', String(v)),
  green: (v: string | number) => styleText('green', String(v)),
}

/**
 * @param filePath package.json 绝对路径
 */
const getProjectName = (filePath: string): string => {
  let relativePath = filePath.replace(root, '')
  relativePath = relativePath.startsWith(path.sep) ? relativePath.slice(1) : relativePath
  return relativePath.replace(`${path.sep}package.json`, '')
}

const nochange = color.gray
const colors = [
  color.red, // major
  color.yellow, // minor
  color.green, // patch
]

/**
 * 高亮新版本：只把变化位及其后续位着色
 */
const parseNewVersion = (oldVer: string, newVer: string): string => {
  if (!oldVer || !oldVer.includes('.') || !newVer.includes('.')) return color.green(newVer)

  let prefix = /^(?:[^\d])+/.exec(newVer)?.[0] ?? ''
  const oldParts = oldVer
    .replace(/^(?:[^\d])+/, '')
    .split('.')
    .map(Number)
  const newParts = newVer.replace(prefix, '').split('.').map(Number)

  if (oldParts.length !== 3 || newParts.length !== 3) return color.green(newVer)

  let prevColor: (v: string | number) => string = nochange
  prefix &&= nochange(prefix)

  return (
    prefix +
    newParts
      .map((n, i) => {
        if (prevColor !== nochange) return prevColor(n)
        if (n > oldParts[i]) {
          prevColor = prefix ? colors[i] : color.red
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
//   parseNewVersion('^1.2.3', '^1.2.4'),
//   parseNewVersion('1.2.3', '1.2.4')
// )
let logs: UpdateLogGroup[] = []

const addLog = (filePath: string, oldPkgs: Record<string, string>, updatedPkgs: Array<[string, string]>) => {
  if (!updatedPkgs.length) return
  logs.push([
    getProjectName(filePath),
    updatedPkgs.map(([name, nextVer]) => [name, oldPkgs[name] ?? '', parseNewVersion(oldPkgs[name] ?? '', nextVer)]),
  ])
}

const padding = (length: number): string => ' '.repeat(Math.max(0, length))

const printLog = (): void => {
  if (!logs.length) return

  let logsStr = ''
  let maxNameLen = 0
  let maxOldVerLen = 0

  for (const [, items] of logs) {
    for (const [name, oldVer] of items) {
      maxNameLen = Math.max(maxNameLen, name.length)
      maxOldVerLen = Math.max(maxOldVerLen, oldVer.length)
    }
  }

  for (const [project, items] of logs) {
    logsStr += `${project}:\n${items
      .map(
        ([name, oldVer, newVer]) =>
          `    ${color.blue(name)}: ${padding(maxNameLen - name.length + (maxOldVerLen - oldVer.length))}${color.gray(oldVer)}  →  ${newVer}`
      )
      .join('\n')}\n`
  }

  console.log(logsStr)
}

const run = async () => {
  for (const packageFile of packages) {
    const pkg = JSON.parse(await fs.promises.readFile(packageFile, 'utf-8')) as PackageJsonLike
    const oldPkgs: Record<string, string> = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
    const updatedPkgs: Record<string, string> = {}

    console.log(`Checking ${color.blue(getProjectName(packageFile))}...`)

    for (const config of configs) {
      const updated = await runNcu({
        packageFile,
        upgrade: true,
        cooldown: '8h',
        jsonUpgraded: true,
        dep: ['prod', 'dev', 'optional'],
        ...config,
      })

      if (updated && typeof updated === 'object') {
        Object.assign(updatedPkgs, updated as Record<string, string>)
      } else if (typeof updated === 'string') {
        console.log(updated)
      }
    }

    addLog(packageFile, oldPkgs, Object.entries(updatedPkgs))
  }

  printLog()
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
