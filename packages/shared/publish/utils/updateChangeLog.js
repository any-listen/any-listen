import { readFile, writeFile } from 'node:fs/promises'

import chalk from 'chalk'

import { formatTime, jp } from './index.js'
import { parseChangelog } from './parseChangelog.js'
let pkgDir = ''
let changelogPath = ''
let curChangelogPath = ''
let versionPath = ''
let pkg = {
  version: '',
  repository: {
    url: '',
  },
}
/**
 * @type {{
 *   version: string
 *   time: string
 *   desc: string
 *   beta?: Array<{
 *     version: string
 *     time: string
 *     desc: string
 *    }>
 *   history: Array<{
 *    version: string
 *     time: string
 *     desc: string
 *   }>
 * }}
 */
let versionFile = {
  version: '',
  time: '',
  desc: '',
  history: [
    {
      version: '',
      time: '',
      desc: '',
    },
  ],
}
let isBeta = false

const dir = {
  'web-server': '../../../web-server',
  desktop: '../../../desktop',
}

/**
 *
 * @param {'web-server' | 'desktop'} type
 */
const initPath = async (type) => {
  pkgDir = jp(dir[type], 'package.json')
  changelogPath = jp(dir[type], 'CHANGELOG.md')
  curChangelogPath = jp(dir[type], 'publish/changeLog.md')
  pkg = JSON.parse((await readFile(pkgDir, 'utf-8')).toString())
}

/**
 *
 * @param {'web-server' | 'desktop'} type
 * @param {string} version
 */
const initVersionFile = async (type, version) => {
  isBeta = !/^\d+\.\d+\.\d+$/.test(version)
  if (isBeta) curChangelogPath = jp(dir[type], 'publish/changeLog.beta.md')
  versionPath = jp(dir[type], 'publish/version.json')
  versionFile = JSON.parse((await readFile(versionPath, 'utf-8')).toString())
}

// const md_renderer = markdownStr => new (require('markdown-it'))({
//   html: true,
//   linkify: true,
//   typographer: true,
//   breaks: true,
// }).render(markdownStr)

const getPrevVer = async () => {
  const str = (await readFile(changelogPath, 'utf-8')).toString()
  const versions = parseChangelog(str)
  if (!versions.length) throw new Error('CHANGELOG 无法解析到版本号')
  return versions[0].version
}

/**
 *
 * @param {string} newVerNum
 * @param {string} newChangeLog
 */
const handleUpdateChangeLog = async (newVerNum, newChangeLog) => {
  let changeLog = (await readFile(changelogPath, 'utf-8')).toString()
  const prevVer = await getPrevVer()
  const log = `## [${newVerNum}](${pkg.repository.url.replace(/^git\+(http.+)\.git$/, '$1')}/compare/v${prevVer}...v${newVerNum}) - ${formatTime(new Date())}\n\n${newChangeLog}`
  await writeFile(changelogPath, changeLog.replace(/(## \[?(?:\d+\.))/, `${log}\n\n$1`), 'utf-8')
}

// const renderChangeLog = md => md_renderer(md)

/**
 *
 * @param {'web-server' | 'desktop'} type
 * @param {string} newVersion
 * @returns
 */
export const updateVersionFile = async (type, newVersion) => {
  await initPath(type)
  newVersion = pkg.version
  await initVersionFile(type, newVersion)
  const newMDChangeLog = (await readFile(curChangelogPath, 'utf-8')).toString()
  // const newChangeLog = renderChangeLog(newMDChangeLog)
  const desc = newMDChangeLog.trim()
  if (isBeta) {
    if (!versionFile.beta) versionFile.beta = []
    versionFile.beta.unshift({
      version: newVersion,
      desc,
      time: new Date().toISOString(),
    })
  } else {
    versionFile.history.unshift({
      version: versionFile.version,
      desc: versionFile.desc,
      time: versionFile.time,
    })
    versionFile.version = newVersion
    versionFile.desc = desc
    versionFile.time = new Date().toISOString()
    if (versionFile.beta) delete versionFile.beta
    await handleUpdateChangeLog(newVersion, newMDChangeLog.trim())
  }
  await writeFile(versionPath, `${JSON.stringify(versionFile)}\n`, 'utf-8')

  if (pkg.version != newVersion) {
    pkg.version = newVersion
    await writeFile(jp(pkgDir), `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
  }

  console.log(chalk.blue('new version: ') + chalk.green(newVersion))
}
