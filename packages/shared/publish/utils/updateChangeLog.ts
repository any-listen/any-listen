import { readFile, writeFile } from 'node:fs/promises'
import { styleText } from 'node:util'

import { formatTime, jp } from './index.ts'
import { parseChangelog } from './parseChangelog.ts'
type PublishType = 'web-server' | 'desktop'

interface PackageMeta {
  version: string
  repository: {
    url: string
  }
}

interface VersionItem {
  version: string
  time: string
  desc: string
}

interface VersionFile {
  version: string
  time: string
  desc: string
  beta?: VersionItem[]
  history: VersionItem[]
}

let pkgDir = ''
let changelogPath = ''
let curChangelogPath = ''
let versionPath = ''
let pkg: PackageMeta = {
  version: '',
  repository: {
    url: '',
  },
}
let versionFile: VersionFile = {
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

/**
 * 自动递增版本号，例如 0.1.0 -> 0.1.1，0.1.0-beta.0 -> 0.1.0-beta.1
 */
const incrementVersion = (version: string): string => {
  const match = /^(\d+\.\d+\.)(\d+)(?:-([^.]+)\.(\d+))?$/.exec(version)
  if (!match) throw new Error(`无法解析版本号: ${version}`)
  const [, prefix, patch, prereleaseTag, prereleaseNum] = match
  if (prereleaseTag) return `${prefix}${patch}-${prereleaseTag}.${Number(prereleaseNum) + 1}`
  return `${prefix}${Number(patch) + 1}`
}

const dir = {
  'web-server': '../../../web-server',
  desktop: '../../../desktop',
} as const

const initPath = async (type: PublishType) => {
  pkgDir = jp(dir[type], 'package.json')
  changelogPath = jp(dir[type], 'CHANGELOG.md')
  curChangelogPath = jp(dir[type], 'publish/changeLog.md')
  pkg = JSON.parse((await readFile(pkgDir, 'utf-8')).toString()) as PackageMeta
}

const initVersionFile = async (type: PublishType, version: string) => {
  isBeta = !/^\d+\.\d+\.\d+$/.test(version)
  if (isBeta) curChangelogPath = jp(dir[type], 'publish/changeLog.beta.md')
  versionPath = jp(dir[type], 'publish/version.json')
  versionFile = JSON.parse((await readFile(versionPath, 'utf-8')).toString()) as VersionFile
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

const handleUpdateChangeLog = async (newVerNum: string, newChangeLog: string) => {
  const changeLog = (await readFile(changelogPath, 'utf-8')).toString()
  const prevVer = await getPrevVer()
  const log = `## [${newVerNum}](${pkg.repository.url.replace(/^git\+(http.+)\.git$/, '$1')}/compare/v${prevVer}...v${newVerNum}) - ${formatTime(new Date())}\n\n${newChangeLog}`
  await writeFile(changelogPath, changeLog.replace(/(## \[?(?:\d+\.))/, `${log}\n\n$1`), 'utf-8')
}

// const renderChangeLog = md => md_renderer(md)

export const updateVersionFile = async (type: PublishType, autoIncrement: boolean): Promise<string> => {
  await initPath(type)
  let newVersion = autoIncrement ? incrementVersion(pkg.version) : pkg.version
  await initVersionFile(type, newVersion)

  let existingVersion = isBeta ? versionFile.beta?.[0]?.version : versionFile.version
  if (existingVersion === newVersion) {
    // 未显式要求递增时，版本号已存在则自动递增一次再试
    if (autoIncrement) throw new Error(`[${type}] 版本 ${newVersion} 已存在，请先更新 package.json 中的版本号`)
    newVersion = incrementVersion(newVersion)
    await initVersionFile(type, newVersion)
    existingVersion = isBeta ? versionFile.beta?.[0]?.version : versionFile.version
    if (existingVersion === newVersion) throw new Error(`[${type}] 版本 ${newVersion} 已存在，请先更新 package.json 中的版本号`)
  }

  const newMDChangeLog = (await readFile(curChangelogPath, 'utf-8')).toString()
  // const newChangeLog = renderChangeLog(newMDChangeLog)
  const desc = newMDChangeLog.trim()
  if (isBeta) {
    versionFile.beta ||= []
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
    await writeFile(pkgDir, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
  }

  console.log(styleText('blue', 'new version: ') + styleText('green', newVersion))
  return newVersion
}
