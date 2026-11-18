import path from 'node:path'

import { checkAndCreateDir, copyFile, removePath } from '@any-listen/nodejs'
import type Database from 'better-sqlite3'

import { BACKUP_DIR_NAME, DAILY_BACKUP_DIR_NAME, EVENT_BACKUP_DIR_NAME } from './constants'
import type { BackupPathInfo, BackupType, BackupTrigger } from './types'

let defaultBackupPath = ''
let backupPath = ''
export const resolveBackupType = (trigger: BackupTrigger): BackupType => {
  return trigger == 'event' ? 'event' : 'daily'
}

export const resolveBackupPathInfo = async (db: Database.Database, type: BackupType): Promise<BackupPathInfo | null> => {
  const dbPath = db.name
  if (!dbPath || dbPath == ':memory:') return null

  const parsed = path.parse(dbPath)
  if (backupPath) {
    try {
      await checkAndCreateDir(backupPath)
    } catch (err) {
      console.error('Failed to create backup path:', err)
      // eslint-disable-next-line require-atomic-updates
      backupPath = parsed.dir
    }
  } else backupPath = parsed.dir
  const subDir = type == 'daily' ? DAILY_BACKUP_DIR_NAME : EVENT_BACKUP_DIR_NAME
  const backupDir = path.join(backupPath, BACKUP_DIR_NAME, subDir)
  const prefix = `${parsed.name}.db.`

  return {
    dir: backupDir,
    prefix,
    filePath: (suffix: string) => path.join(backupDir, `${prefix}${suffix}.bak`),
  }
}

export const initBackupPath = (defaultPath: string, path: string) => {
  defaultBackupPath = defaultPath
  backupPath = path || defaultPath
}
export const setBackupPath = async (path: string) => {
  path ||= defaultBackupPath
  if (backupPath === path) return
  const oldPath = backupPath
  backupPath = path
  try {
    await copyFile(oldPath, path)
    await removePath(oldPath)
  } catch (err) {
    // 迁移失败要回滚：新路径下没有任何备份文件，设置却已指向它，备份历史会分裂
    console.error('Failed to move backup path:', err)
    backupPath = oldPath
    throw err
  }
}

export const formatBackupTimestamp = (time: number) => {
  const d = new Date(time)
  const year = String(d.getFullYear())
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')

  return `${year}${month}${date}-${hour}${minute}${second}${ms}`
}

export const createTempBackupPath = (filePath: BackupPathInfo['filePath']) => {
  const tempSuffix = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return filePath(tempSuffix)
}

export const parseBackupTimestampFromFileName = (name: string, prefix: string): number | null => {
  if (!name.startsWith(prefix) || !name.endsWith('.bak')) return null

  const suffix = name.slice(prefix.length, -4)
  const matched = /^(\d{8})-(\d{9})(?:-\d+)?$/.exec(suffix)
  if (!matched) return null

  const datePart = matched[1]
  const timePart = matched[2]

  const year = parseInt(datePart.slice(0, 4), 10)
  const month = parseInt(datePart.slice(4, 6), 10)
  const day = parseInt(datePart.slice(6, 8), 10)
  const hour = parseInt(timePart.slice(0, 2), 10)
  const minute = parseInt(timePart.slice(2, 4), 10)
  const second = parseInt(timePart.slice(4, 6), 10)
  const millisecond = parseInt(timePart.slice(6, 9), 10)

  const parsedTime = new Date(year, month - 1, day, hour, minute, second, millisecond).getTime()
  return Number.isNaN(parsedTime) ? null : parsedTime
}
