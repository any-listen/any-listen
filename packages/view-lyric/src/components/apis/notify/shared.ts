export interface NotifyItem {
  id: string
  message: string
  autoCloseTime: number
  extId: string
  selectText: boolean
  onafterleave?: () => void
}
