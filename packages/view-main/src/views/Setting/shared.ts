export const viewTypes = ['app', 'extension', 'logs'] as const

export type ViewType = (typeof viewTypes)[number]
