import { buildQueryParams } from '@/plugins/routes'

export const queryType = ['list', 'detail'] as const
export type QueryType = (typeof queryType)[number]

export const songlistUrlParamKeyMap = {
  tag: 'tg',
  sort: 'st',
}

export const buildSonglistDetailUrl = (meta: { id: string; sid?: string; mid?: string; s?: string }) => {
  return {
    url: `/online/songlist?${buildQueryParams(meta)}`,
    path: `/online/songlist`,
    meta,
  }
}
