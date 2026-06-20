import { buildQueryParams } from '@/plugins/routes'

export const queryType = ['list', 'detail'] as const
export type QueryType = (typeof queryType)[number]

export const topSongsUrlParamKeyMap = {
  date: 'dt',
}

export const buildTopSongsDetailUrl = (meta: { id: string; sid?: string; mid?: string; s?: string }) => {
  return {
    url: `/online/topSongs?${buildQueryParams(meta)}`,
    path: '/online/topSongs',
    meta,
  }
}
