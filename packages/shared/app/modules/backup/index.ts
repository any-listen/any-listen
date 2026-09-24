import { checkAndCreateDir, dirname, readAnyListenConfigFile, saveAnyListenConfigFile } from '@any-listen/nodejs'

import { getSettings, t } from '../../common'
import { sendMusicListAction } from '../musicList'
import { mergeFullData } from '../sync/shared/list/merge'
import { workers } from '../worker'
import { exportPlayListToCSV, exportPlayListToText } from './exportData'

export const exportData = async (path: string, types: AnyListen.BackupType[]) => {
  const backupData: Partial<AnyListen.BackupData> = {}
  for (const type of types) {
    switch (type) {
      case 'songlist':
        backupData.songlist = {
          version: 1,
          data: await workers.dbService.getAllListData(),
        }
        break

      case 'txt':
        await exportPlayListToText(path, await workers.dbService.getAllListData(), false)
        return
      case 'txt_all':
        await exportPlayListToText(path, await workers.dbService.getAllListData(), true)
        return
      case 'csv':
        await exportPlayListToCSV(
          path,
          await workers.dbService.getAllListData(),
          false,
          `${t('music_name')},${t('music_singer')},${t('music_album')}\n`
        )
        return
      case 'csv_all':
        await exportPlayListToCSV(
          path,
          await workers.dbService.getAllListData(),
          true,
          `${t('music_name')},${t('music_singer')},${t('music_album')}\n`
        )
        return

      default:
        break
    }
  }
  const dir = dirname(path)
  await checkAndCreateDir(dir)
  await saveAnyListenConfigFile(path, backupData)
}

export const importData = async (
  path: string,
  selectData: (types: AnyListen.BackupType[]) => Promise<AnyListen.BackupType[]>,
  getListMergeMode: () => Promise<AnyListen.List.MergeMode>
) => {
  const data = await readAnyListenConfigFile<Partial<AnyListen.BackupData>>(path)
  const types: AnyListen.BackupType[] = []
  if (data.songlist?.data) types.push('songlist')
  if (data.settings) types.push('settings')
  const dataTypes = await selectData(types)
  for (const type of dataTypes) {
    switch (type) {
      case 'songlist': {
        const localListData = await workers.dbService.getAllListData()
        const [listData, requiredUpdateLocalListData] = await mergeFullData(
          localListData,
          { ...localListData, ...data.songlist!.data },
          getSettings()['list.addMusicLocationType'],
          getListMergeMode,
          async () => {
            return workers.dbService.getAllListData()
          }
        )
        if (requiredUpdateLocalListData) await sendMusicListAction({ action: 'list_data_overwrite', data: listData })
        break
      }
      case 'settings':
        break
      default:
        break
    }
  }
}
