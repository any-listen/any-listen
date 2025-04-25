import type { resourceList } from '@/modules/extension/reactive.svelte'

export const viewTypes = ['search', 'songlist', 'leaderboard', 'album', 'singer'] as const

export const viewResourceMap = {
  search: ['musicSearch', 'songlistSearch', 'albumSearch', 'singerSearch'],
  songlist: ['songlist'],
  leaderboard: ['leaderboard'],
  album: ['album'],
  singer: ['singer'],
} as const

export type ResourceListType = StoresValues<typeof resourceList>
export type ResourceType = NonNullable<ResourceListType[keyof ResourceListType]>[number]
